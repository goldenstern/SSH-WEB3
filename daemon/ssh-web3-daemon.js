#!/usr/bin/env node

/**
 * SSH-WEB3 Daemon
 * Secure server management daemon for Web3 authentication
 */

const http = require("http")
const https = require("https")
const fs = require("fs")
const path = require("path")
const { Server } = require("socket.io")
const { ethers } = require("ethers")
const ssh2 = require("ssh2")
const mysql = require("mysql2/promise")
const { exec } = require("child_process")
const crypto = require("crypto")
const yargs = require("yargs/yargs")
const { hideBin } = require("yargs/helpers")

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option("port", {
    alias: "p",
    description: "Port to run the daemon on",
    type: "number",
    default: 3001,
  })
  .option("ssl", {
    description: "Enable SSL",
    type: "boolean",
    default: false,
  })
  .option("cert", {
    description: "Path to SSL certificate",
    type: "string",
  })
  .option("key", {
    description: "Path to SSL key",
    type: "string",
  })
  .option("allowed-origins", {
    description: "Comma-separated list of allowed origins",
    type: "string",
    default: "http://localhost:3000",
  })
  .option("config", {
    alias: "c",
    description: "Path to config file",
    type: "string",
  })
  .help()
  .alias("help", "h").argv

// Load config file if provided
let config = {
  port: argv.port,
  ssl: argv.ssl,
  cert: argv.cert,
  key: argv.key,
  allowedOrigins: argv.allowedOrigins.split(","),
  authorizedAddresses: [],
  logLevel: "info",
}

if (argv.config) {
  try {
    const configFile = JSON.parse(fs.readFileSync(argv.config, "utf8"))
    config = { ...config, ...configFile }
    console.log(`Loaded config from ${argv.config}`)
  } catch (error) {
    console.error(`Error loading config file: ${error.message}`)
    process.exit(1)
  }
}

// Setup logging
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

const log = (level, message) => {
  if (logLevels[level] <= logLevels[config.logLevel]) {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`)
  }
}

// Create server (HTTP or HTTPS)
let server
if (config.ssl && config.cert && config.key) {
  try {
    const credentials = {
      key: fs.readFileSync(config.key, "utf8"),
      cert: fs.readFileSync(config.cert, "utf8"),
    }
    server = https.createServer(credentials)
    log("info", "Created HTTPS server with SSL")
  } catch (error) {
    log("error", `Error loading SSL certificates: ${error.message}`)
    process.exit(1)
  }
} else {
  server = http.createServer()
  log("warn", "Created HTTP server without SSL. This is not recommended for production.")
}

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: config.allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Active sessions
const sessions = new Map()

// Verify Web3 signature
const verifySignature = (address, message, signature) => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature)
    return recoveredAddress.toLowerCase() === address.toLowerCase()
  } catch (error) {
    log("error", `Signature verification error: ${error.message}`)
    return false
  }
}

// Check if address is authorized
const isAuthorized = (address) => {
  // If no authorized addresses are specified, allow all
  if (!config.authorizedAddresses || config.authorizedAddresses.length === 0) {
    return true
  }

  return config.authorizedAddresses.some((addr) => addr.toLowerCase() === address.toLowerCase())
}

// Handle SSH connections
const handleSSHConnection = (socket, connectionDetails) => {
  const { host, port, username, privateKey, password } = connectionDetails

  const sshClient = new ssh2.Client()

  sshClient.on("ready", () => {
    log("info", `SSH connection established to ${host}:${port}`)
    socket.emit("ssh:connected")

    // Create a new shell session
    sshClient.shell((err, stream) => {
      if (err) {
        log("error", `Shell error: ${err.message}`)
        socket.emit("ssh:error", { message: "Failed to create shell" })
        return
      }

      // Store the stream in the session
      const sessionId = socket.id
      sessions.set(sessionId, {
        stream,
        sshClient,
        type: "ssh",
      })

      // Handle data from the SSH server
      stream.on("data", (data) => {
        socket.emit("ssh:data", data.toString("utf8"))
      })

      // Handle SSH stream close
      stream.on("close", () => {
        log("info", "SSH stream closed")
        socket.emit("ssh:closed")
        sessions.delete(sessionId)
      })

      // Handle SSH stream errors
      stream.on("error", (err) => {
        log("error", `SSH stream error: ${err.message}`)
        socket.emit("ssh:error", { message: err.message })
      })
    })
  })

  sshClient.on("error", (err) => {
    log("error", `SSH connection error: ${err.message}`)
    socket.emit("ssh:error", { message: err.message })
  })

  sshClient.on("end", () => {
    log("info", "SSH connection ended")
    socket.emit("ssh:disconnected")
  })

  // Connect to the SSH server
  const connectConfig = {
    host,
    port: port || 22,
    username,
    readyTimeout: 30000,
  }

  // Use private key or password
  if (privateKey) {
    connectConfig.privateKey = privateKey
  } else if (password) {
    connectConfig.password = password
  }

  sshClient.connect(connectConfig)
}

// Handle SFTP connections
const handleSFTPConnection = (socket, connectionDetails) => {
  const { host, port, username, privateKey, password } = connectionDetails

  const sshClient = new ssh2.Client()

  sshClient.on("ready", () => {
    log("info", `SFTP connection established to ${host}:${port}`)

    sshClient.sftp((err, sftp) => {
      if (err) {
        log("error", `SFTP error: ${err.message}`)
        socket.emit("sftp:error", { message: "Failed to create SFTP session" })
        return
      }

      // Store the SFTP session
      const sessionId = socket.id
      sessions.set(sessionId, {
        sftp,
        sshClient,
        type: "sftp",
      })

      socket.emit("sftp:connected")

      // Handle directory listing
      socket.on("sftp:readdir", ({ path }) => {
        sftp.readdir(path, (err, list) => {
          if (err) {
            log("error", `SFTP readdir error: ${err.message}`)
            socket.emit("sftp:error", { message: err.message, operation: "readdir", path })
            return
          }

          // Format the file list
          const files = list.map((item) => ({
            name: item.filename,
            type: item.attrs.isDirectory() ? "directory" : "file",
            size: item.attrs.size,
            modified: new Date(item.attrs.mtime * 1000).toISOString(),
            permissions: item.attrs.mode,
          }))

          socket.emit("sftp:readdir:response", { path, files })
        })
      })

      // Handle file download
      socket.on("sftp:download", ({ path }) => {
        sftp.stat(path, (err, stats) => {
          if (err) {
            log("error", `SFTP stat error: ${err.message}`)
            socket.emit("sftp:error", { message: err.message, operation: "download", path })
            return
          }

          if (stats.isDirectory()) {
            socket.emit("sftp:error", { message: "Cannot download a directory", operation: "download", path })
            return
          }

          const stream = sftp.createReadStream(path)
          let data = Buffer.from("")

          stream.on("data", (chunk) => {
            data = Buffer.concat([data, chunk])
          })

          stream.on("end", () => {
            socket.emit("sftp:download:response", {
              path,
              data: data.toString("base64"),
              name: path.split("/").pop(),
              size: stats.size,
            })
            log("info", `File downloaded: ${path}`)
          })

          stream.on("error", (err) => {
            log("error", `SFTP download error: ${err.message}`)
            socket.emit("sftp:error", { message: err.message, operation: "download", path })
          })
        })
      })

      // Handle file upload
      socket.on("sftp:upload", ({ path, data, encoding }) => {
        const buffer = Buffer.from(data, encoding || "base64")
        const stream = sftp.createWriteStream(path)

        stream.on("error", (err) => {
          log("error", `SFTP upload error: ${err.message}`)
          socket.emit("sftp:error", { message: err.message, operation: "upload", path })
        })

        stream.on("close", () => {
          socket.emit("sftp:upload:response", { path, success: true })
          log("info", `File uploaded: ${path}`)
        })

        stream.end(buffer)
      })

      // Handle file/directory deletion
      socket.on("sftp:delete", ({ path, isDirectory }) => {
        const deleteOperation = isDirectory ? sftp.rmdir.bind(sftp) : sftp.unlink.bind(sftp)

        deleteOperation(path, (err) => {
          if (err) {
            log("error", `SFTP delete error: ${err.message}`)
            socket.emit("sftp:error", { message: err.message, operation: "delete", path })
            return
          }

          socket.emit("sftp:delete:response", { path, success: true })
          log("info", `${isDirectory ? "Directory" : "File"} deleted: ${path}`)
        })
      })

      // Handle directory creation
      socket.on("sftp:mkdir", ({ path }) => {
        sftp.mkdir(path, (err) => {
          if (err) {
            log("error", `SFTP mkdir error: ${err.message}`)
            socket.emit("sftp:error", { message: err.message, operation: "mkdir", path })
            return
          }

          socket.emit("sftp:mkdir:response", { path, success: true })
          log("info", `Directory created: ${path}`)
        })
      })
    })
  })

  sshClient.on("error", (err) => {
    log("error", `SFTP connection error: ${err.message}`)
    socket.emit("sftp:error", { message: err.message })
  })

  sshClient.on("end", () => {
    log("info", "SFTP connection ended")
    socket.emit("sftp:disconnected")
  })

  // Connect to the SSH server for SFTP
  const connectConfig = {
    host,
    port: port || 22,
    username,
    readyTimeout: 30000,
  }

  // Use private key or password
  if (privateKey) {
    connectConfig.privateKey = privateKey
  } else if (password) {
    connectConfig.password = password
  }

  sshClient.connect(connectConfig)
}

// Add this function to the daemon code, after the handleSFTPConnection function

// Handle opening files in system editor
const handleOpenInSystemEditor = (socket, { path, host, username }) => {
  if (!socket.data.address) {
    socket.emit("editor:error", { message: "Authentication required" })
    return
  }

  log("info", `Request to open file in system editor: ${path} on ${host} as ${username}`)

  // This implementation depends on the operating system
  // For Linux/macOS, we can use xdg-open or open
  // For Windows, we can use start
  const isWindows = process.platform === 'win32'
  const isMac = process.platform === 'darwin'
  
  // Determine the command to use based on the OS
  let command
  if (isWindows) {
    command = 'start'
  } else if (isMac) {
    command = 'open'
  } else {
    command = 'xdg-open'
  }

  // For security reasons, we need to establish an SSH connection first
  // and then use that to execute the command
  const sshClient = new ssh2.Client()

  sshClient.on('ready', () => {
    log("info", `SSH connection established to ${host} for system editor`)

    // Execute the command to open the file
    sshClient.exec(`${command} "${path}"`, (err, stream) => {
      if (err) {
        log("error", `Failed to execute system editor command: ${err.message}`)
        socket.emit("editor:error", { message: "Failed to open file in system editor" })
        sshClient.end()
        return
      }

      let errorOutput = ''
      stream.stderr.on('data', (data) => {
        errorOutput += data.toString('utf8')
      })

      stream.on('close', (code) => {
        if (code !== 0) {
          log("error", `System editor command exited with code ${code}: ${errorOutput}`)
          socket.emit("editor:error", { message: "Failed to open file in system editor" })
        } else {
          log("info", `File opened in system editor: ${path}`)
          socket.emit("editor:opened", { path })
        }
        sshClient.end()
      })
    })
  })

  sshClient.on('error', (err) => {
    log("error", `SSH connection error for system editor: ${err.message}`)
    socket.emit("editor:error", { message: err.message })
  })

  // Connect to the SSH server
  const connectConfig = {
    host,
    port: 22, // Default SSH port
    username,
    readyTimeout: 30000,
  }

  // In a real implementation, you would need to handle authentication
  // This could be via private key or password
  sshClient.connect(connectConfig)
}

// Handle database connections
const handleDatabaseConnection = async (socket, connectionDetails) => {
  const { type, host, port, user, password, database } = connectionDetails

  if (type !== "mysql") {
    socket.emit("db:error", { message: `Database type ${type} not supported yet` })
    return
  }

  try {
    // Create MySQL connection
    const connection = await mysql.createConnection({
      host,
      port: port || 3306,
      user,
      password,
      database,
    })

    // Store the connection
    const sessionId = socket.id
    sessions.set(sessionId, {
      connection,
      type: "database",
      dbType: type,
    })

    log("info", `Database connection established to ${host}:${port}`)
    socket.emit("db:connected", { type, database })

    // Handle database queries
    socket.on("db:query", async ({ query, params }) => {
      try {
        const [results, fields] = await connection.execute(query, params || [])
        socket.emit("db:query:response", { results, fields })
        log("info", `Query executed: ${query.substring(0, 100)}${query.length > 100 ? "..." : ""}`)
      } catch (error) {
        log("error", `Database query error: ${error.message}`)
        socket.emit("db:error", { message: error.message, query })
      }
    })

    // Handle database schema request
    socket.on("db:schema", async () => {
      try {
        // Get tables
        const [tables] = await connection.query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = ?",
          [database],
        )

        const schema = []

        // Get columns for each table
        for (const table of tables) {
          const tableName = table.table_name
          const [columns] = await connection.query(
            "SELECT column_name, data_type, column_key, is_nullable, column_default " +
              "FROM information_schema.columns " +
              "WHERE table_schema = ? AND table_name = ?",
            [database, tableName],
          )

          schema.push({
            name: tableName,
            columns: columns.map((col) => ({
              name: col.column_name,
              type: col.data_type,
              isPrimary: col.column_key === "PRI",
              isNullable: col.is_nullable === "YES",
              default: col.column_default,
            })),
          })
        }

        socket.emit("db:schema:response", { schema })
        log("info", `Schema retrieved for database ${database}`)
      } catch (error) {
        log("error", `Database schema error: ${error.message}`)
        socket.emit("db:error", { message: error.message, operation: "schema" })
      }
    })
  } catch (error) {
    log("error", `Database connection error: ${error.message}`)
    socket.emit("db:error", { message: error.message })
  }
}

// Socket.IO connection handling
io.on("connection", (socket) => {
  log("info", `New connection: ${socket.id}`)

  // Handle authentication
  socket.on("auth", async (data) => {
    const { address, message, signature } = data

    if (!address || !message || !signature) {
      socket.emit("auth:error", { message: "Missing authentication parameters" })
      return
    }

    // Verify the signature
    const isValid = verifySignature(address, message, signature)
    if (!isValid) {
      log("warn", `Invalid signature from ${address}`)
      socket.emit("auth:error", { message: "Invalid signature" })
      return
    }

    // Check if the address is authorized
    if (!isAuthorized(address)) {
      log("warn", `Unauthorized address: ${address}`)
      socket.emit("auth:error", { message: "Address not authorized" })
      return
    }

    // Authentication successful
    log("info", `Authenticated: ${address}`)
    socket.emit("auth:success", { address })

    // Store the authenticated address
    socket.data.address = address
  })

  // Handle SSH connection request
  socket.on("ssh:connect", (connectionDetails) => {
    if (!socket.data.address) {
      socket.emit("ssh:error", { message: "Authentication required" })
      return
    }

    handleSSHConnection(socket, connectionDetails)
  })

  // Handle SSH command
  socket.on("ssh:command", (command) => {
    const session = sessions.get(socket.id)
    if (!session || session.type !== "ssh") {
      socket.emit("ssh:error", { message: "No active SSH session" })
      return
    }

    session.stream.write(`${command}\n`)
  })

  // Handle SFTP connection request
  socket.on("sftp:connect", (connectionDetails) => {
    if (!socket.data.address) {
      socket.emit("sftp:error", { message: "Authentication required" })
      return
    }

    handleSFTPConnection(socket, connectionDetails)
  })

  // Handle database connection request
  socket.on("db:connect", (connectionDetails) => {
    if (!socket.data.address) {
      socket.emit("db:error", { message: "Authentication required" })
      return
    }

    handleDatabaseConnection(socket, connectionDetails)
  })

  // Add this to the socket.io connection handling section
  socket.on("editor:open", (fileDetails) => {
    handleOpenInSystemEditor(socket, fileDetails)
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    log("info", `Disconnected: ${socket.id}`)

    // Clean up any active sessions
    const session = sessions.get(socket.id)
    if (session) {
      if (session.type === "ssh" || session.type === "sftp") {
        session.sshClient.end()
      } else if (session.type === "database") {
        session.connection.end()
      }

      sessions.delete(socket.id)
    }
  })
})

// Start the server
server.listen(config.port, () => {
  log("info", `SSH-WEB3 daemon listening on port ${config.port}`)
  log("info", `Allowed origins: ${config.allowedOrigins.join(", ")}`)

  if (config.authorizedAddresses && config.authorizedAddresses.length > 0) {
    log("info", `Authorized addresses: ${config.authorizedAddresses.join(", ")}`)
  } else {
    log("warn", "No authorized addresses specified. Any authenticated address will be allowed.")
  }
})

// Handle process termination
process.on("SIGINT", () => {
  log("info", "Shutting down...")

  // Close all active sessions
  for (const [id, session] of sessions.entries()) {
    if (session.type === "ssh" || session.type === "sftp") {
      session.sshClient.end()
    } else if (session.type === "database") {
      session.connection.end()
    }
  }

  server.close(() => {
    log("info", "Server closed")
    process.exit(0)
  })
})
