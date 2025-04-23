#!/usr/bin/env node

/**
 * SSH-WEB3 Daemon Service Installer
 * Installs the daemon as a system service
 */

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")
const readline = require("readline")
const os = require("os")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Check if running as root
if (process.getuid && process.getuid() !== 0) {
  console.error("This script must be run as root")
  process.exit(1)
}

// Detect the init system
let initSystem = "unknown"
try {
  const systemctl = execSync("which systemctl").toString().trim()
  if (systemctl) {
    initSystem = "systemd"
  }
} catch (error) {
  try {
    const upstart = execSync("which initctl").toString().trim()
    if (upstart) {
      initSystem = "upstart"
    }
  } catch (error) {
    try {
      const sysvinit = execSync("which service").toString().trim()
      if (sysvinit) {
        initSystem = "sysvinit"
      }
    } catch (error) {
      console.error("Could not detect init system")
      process.exit(1)
    }
  }
}

console.log(`Detected init system: ${initSystem}`)

// Get the current directory
const currentDir = process.cwd()
const daemonPath = path.join(currentDir, "ssh-web3-daemon.js")

// Check if the daemon file exists
if (!fs.existsSync(daemonPath)) {
  console.error(`Daemon file not found: ${daemonPath}`)
  process.exit(1)
}

// Make the daemon executable
try {
  fs.chmodSync(daemonPath, "755")
} catch (error) {
  console.error(`Failed to make daemon executable: ${error.message}`)
  process.exit(1)
}

// Ask for configuration
rl.question("Enter the port to run the daemon on [3001]: ", (port) => {
  port = port || "3001"

  rl.question("Enter comma-separated allowed origins [http://localhost:3000]: ", (origins) => {
    origins = origins || "http://localhost:3000"

    rl.question("Enter comma-separated authorized wallet addresses (leave empty for any): ", (addresses) => {
      rl.question("Install as system service? (y/n) [y]: ", (installService) => {
        installService = installService.toLowerCase() === "n" ? false : true

        // Create config file
        const config = {
          port: Number.parseInt(port, 10),
          ssl: false,
          allowedOrigins: origins.split(",").map((o) => o.trim()),
          logLevel: "info",
        }

        if (addresses) {
          config.authorizedAddresses = addresses.split(",").map((a) => a.trim())
        }

        try {
          fs.writeFileSync(path.join(currentDir, "config.json"), JSON.stringify(config, null, 2))
          console.log("Created config.json")
        } catch (error) {
          console.error(`Failed to create config file: ${error.message}`)
          process.exit(1)
        }

        if (installService) {
          // Install as a service based on the init system
          if (initSystem === "systemd") {
            installSystemdService(port)
          } else if (initSystem === "upstart") {
            installUpstartService(port)
          } else if (initSystem === "sysvinit") {
            installSysvinitService(port)
          } else {
            console.error("Unsupported init system")
            process.exit(1)
          }
        } else {
          console.log("Service installation skipped")
          console.log("You can start the daemon manually with:")
          console.log(`  node ${daemonPath} --config=${path.join(currentDir, "config.json")}`)
          rl.close()
        }
      })
    })
  })
})

function installSystemdService(port) {
  const serviceContent = `[Unit]
Description=SSH-WEB3 Daemon
After=network.target

[Service]
ExecStart=${process.execPath} ${daemonPath} --config=${path.join(currentDir, "config.json")}
Restart=always
User=root
Group=root
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=${currentDir}

[Install]
WantedBy=multi-user.target
`

  try {
    fs.writeFileSync("/etc/systemd/system/ssh-web3-daemon.service", serviceContent)
    console.log("Created systemd service file")

    execSync("systemctl daemon-reload")
    execSync("systemctl enable ssh-web3-daemon")
    execSync("systemctl start ssh-web3-daemon")

    console.log("Service installed and started")
    console.log("You can manage it with:")
    console.log("  systemctl status ssh-web3-daemon")
    console.log("  systemctl start ssh-web3-daemon")
    console.log("  systemctl stop ssh-web3-daemon")
    console.log("  systemctl restart ssh-web3-daemon")

    rl.close()
  } catch (error) {
    console.error(`Failed to install service: ${error.message}`)
    process.exit(1)
  }
}

function installUpstartService(port) {
  const serviceContent = `description "SSH-WEB3 Daemon"

start on runlevel [2345]
stop on runlevel [016]

respawn
respawn limit 10 5

setuid root
setgid root

env NODE_ENV=production
env PATH=/usr/bin:/usr/local/bin

chdir ${currentDir}

exec ${process.execPath} ${daemonPath} --config=${path.join(currentDir, "config.json")}
`

  try {
    fs.writeFileSync("/etc/init/ssh-web3-daemon.conf", serviceContent)
    console.log("Created upstart service file")

    execSync("initctl reload-configuration")
    execSync("initctl start ssh-web3-daemon")

    console.log("Service installed and started")
    console.log("You can manage it with:")
    console.log("  initctl status ssh-web3-daemon")
    console.log("  initctl start ssh-web3-daemon")
    console.log("  initctl stop ssh-web3-daemon")
    console.log("  initctl restart ssh-web3-daemon")

    rl.close()
  } catch (error) {
    console.error(`Failed to install service: ${error.message}`)
    process.exit(1)
  }
}

function installSysvinitService(port) {
  const serviceContent = `#!/bin/sh
### BEGIN INIT INFO
# Provides:          ssh-web3-daemon
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: SSH-WEB3 Daemon
# Description:       Secure server management daemon for Web3 authentication
### END INIT INFO

PATH=/sbin:/usr/sbin:/bin:/usr/bin
DESC="SSH-WEB3 Daemon"
NAME=ssh-web3-daemon
DAEMON=${process.execPath}
DAEMON_ARGS="${daemonPath} --config=${path.join(currentDir, "config.json")}"
PIDFILE=/var/run/$NAME.pid
SCRIPTNAME=/etc/init.d/$NAME
WORKDIR=${currentDir}
USER=root
GROUP=root

# Exit if the package is not installed
[ -x "$DAEMON" ] || exit 0

# Read configuration variable file if it is present
[ -r /etc/default/$NAME ] && . /etc/default/$NAME

# Load the VERBOSE setting and other rcS variables
. /lib/init/vars.sh

# Define LSB log_* functions.
# Depend on lsb-base (>= 3.2-14) to ensure that this file is present
# and status_of_proc is working.
. /lib/lsb/init-functions

do_start()
{
  # Return
  #   0 if daemon has been started
  #   1 if daemon was already running
  #   2 if daemon could not be started
  start-stop-daemon --start --quiet --pidfile $PIDFILE --exec $DAEMON --test > /dev/null \
    || return 1
  start-stop-daemon --start --quiet --pidfile $PIDFILE --exec $DAEMON --chdir $WORKDIR --chuid $USER:$GROUP \
    --background --make-pidfile -- $DAEMON_ARGS \
    || return 2
}

do_stop()
{
  # Return
  #   0 if daemon has been stopped
  #   1 if daemon was already stopped
  #   2 if daemon could not be stopped
  #   other if a failure occurred
  start-stop-daemon --stop --quiet --retry=TERM/30/KILL/5 --pidfile $PIDFILE --name $NAME
  RETVAL="$?"
  [ "$RETVAL" = 2 ] && return 2
  start-stop-daemon --stop --quiet --oknodo --retry=0/30/KILL/5 --exec $DAEMON
  [ "$?" = 2 ] && return 2
  rm -f $PIDFILE
  return "$RETVAL"
}

case "$1" in
  start)
    [ "$VERBOSE" != no ] && log_daemon_msg "Starting $DESC" "$NAME"
    do_start
    case "$?" in
      0|1) [ "$VERBOSE" != no ] && log_end_msg 0 ;;
      2) [ "$VERBOSE" != no ] && log_end_msg 1 ;;
    esac
    ;;
  stop)
    [ "$VERBOSE" != no ] && log_daemon_msg "Stopping $DESC" "$NAME"
    do_stop
    case "$?" in
      0|1) [ "$VERBOSE" != no ] && log_end_msg 0 ;;
      2) [ "$VERBOSE" != no ] && log_end_msg 1 ;;
    esac
    ;;
  restart|force-reload)
    log_daemon_msg "Restarting $DESC" "$NAME"
    do_stop
    case "$?" in
      0|1)
        do_start
        case "$?" in
          0) log_end_msg 0 ;;
          1) log_end_msg 1 ;; # Old process is still running
          *) log_end_msg 1 ;; # Failed to start
        esac
        ;;
      *)
        # Failed to stop
        log_end_msg 1
        ;;
    esac
    ;;
  status)
    status_of_proc "$DAEMON" "$NAME" && exit 0 || exit $?
    ;;
  *)
    echo "Usage: $SCRIPTNAME {start|stop|restart|force-reload|status}" >&2
    exit 3
    ;;
esac

:
`

  try {
    fs.writeFileSync("/etc/init.d/ssh-web3-daemon", serviceContent)
    fs.chmodSync("/etc/init.d/ssh-web3-daemon", "755")
    console.log("Created SysVinit service file")

    execSync("update-rc.d ssh-web3-daemon defaults")
    execSync("service ssh-web3-daemon start")

    console.log("Service installed and started")
    console.log("You can manage it with:")
    console.log("  service ssh-web3-daemon status")
    console.log("  service ssh-web3-daemon start")
    console.log("  service ssh-web3-daemon stop")
    console.log("  service ssh-web3-daemon restart")

    rl.close()
  } catch (error) {
    console.error(`Failed to install service: ${error.message}`)
    process.exit(1)
  }
}
