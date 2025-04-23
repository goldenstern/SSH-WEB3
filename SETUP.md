# SSH-WEB3 Setup & Deployment Guide

This guide will walk you through setting up and deploying the SSH-WEB3 platform, which consists of:

1. The Web Application (frontend)
2. The SSH-WEB3 Daemon (server-side component)

## System Requirements

### Web Application
- Node.js 18.x or later
- npm or yarn
- A web server (for production deployment)

### SSH-WEB3 Daemon
- Linux/Ubuntu or Windows Server
- Node.js 18.x or later
- npm or yarn
- Root/Administrator access (for service installation)

## Daemon Installation

The SSH-WEB3 daemon is the server-side component that handles SSH connections, file transfers, and database operations. It needs to be installed on each server you want to manage.

### Linux/Ubuntu Installation

1. **Clone or download the daemon code**

   \`\`\`bash
   git clone https://github.com/your-username/ssh-web3.git
   cd ssh-web3/daemon
   \`\`\`

2. **Install dependencies**

   \`\`\`bash
   npm install
   \`\`\`

3. **Configure the daemon**

   Copy the example configuration file:

   \`\`\`bash
   cp config.example.json config.json
   \`\`\`

   Edit the configuration file:

   \`\`\`bash
   nano config.json
   \`\`\`

   Adjust the following settings:
   - `port`: The port the daemon will listen on (default: 3001)
   - `ssl`: Set to `true` if you want to use HTTPS (recommended for production)
   - `cert` and `key`: Paths to your SSL certificate and key files (if SSL is enabled)
   - `allowedOrigins`: List of origins allowed to connect to the daemon
   - `authorizedAddresses`: List of Web3 wallet addresses authorized to connect (leave empty to allow any authenticated address)

4. **Install as a service (optional but recommended)**

   Run the service installer with root privileges:

   \`\`\`bash
   sudo node install-service.js
   \`\`\`

   Follow the prompts to configure and install the service.

5. **Manual start (if not installed as a service)**

   \`\`\`bash
   node ssh-web3-daemon.js --config=config.json
   \`\`\`

### Windows Server Installation

1. **Clone or download the daemon code**

   ```powershell
   git clone https://github.com/your-username/ssh-web3.git
   cd ssh-web3\daemon
   \`\`\`

2. **Install dependencies**

   ```powershell
   npm install
   \`\`\`

3. **Configure the daemon**

   Copy the example configuration file:

   ```powershell
   copy config.example.json config.json
   \`\`\`

   Edit the configuration file using your preferred text editor.

4. **Install as a Windows service (optional)**

   Install [node-windows](https://github.com/coreybutler/node-windows):

   ```powershell
   npm install -g node-windows
   npm link node-windows
   \`\`\`

   Create a service installation script:

   ```powershell
   echo "const Service = require('node-windows').Service;
   const svc = new Service({
     name: 'SSH-WEB3 Daemon',
     description: 'Secure server management daemon for Web3 authentication',
     script: require('path').join(__dirname, 'ssh-web3-daemon.js'),
     nodeArgs: ['--config=config.json'],
     workingDirectory: __dirname
   });
   svc.on('install', function() {
     svc.start();
     console.log('Service installed and started');
   });
   svc.install();" > install-service.js
   \`\`\`

   Run the service installer with administrator privileges:

   ```powershell
   node install-service.js
   \`\`\`

5. **Manual start (if not installed as a service)**

   ```powershell
   node ssh-web3-daemon.js --config=config.json
   \`\`\`

## Web Application Deployment

The SSH-WEB3 web application is a Next.js application that can be deployed to various hosting platforms.

### Deploying to Vercel (Recommended)

1. **Clone or download the web application code**

   \`\`\`bash
   git clone https://github.com/your-username/ssh-web3.git
   cd ssh-web3
   \`\`\`

2. **Install dependencies**

   \`\`\`bash
   npm install
   \`\`\`

3. **Configure environment variables**

   Create a `.env.local` file:

   \`\`\`
   NEXT_PUBLIC_DAEMON_URL=https://your-daemon-server.com:3001
   \`\`\`

4. **Deploy to Vercel**

   \`\`\`bash
   npm install -g vercel
   vercel
   \`\`\`

   Follow the prompts to complete the deployment.

### Self-Hosting

1. **Clone or download the web application code**

   \`\`\`bash
   git clone https://github.com/your-username/ssh-web3.git
   cd ssh-web3
   \`\`\`

2. **Install dependencies**

   \`\`\`bash
   npm install
   \`\`\`

3. **Configure environment variables**

   Create a `.env.local` file:

   \`\`\`
   NEXT_PUBLIC_DAEMON_URL=https://your-daemon-server.com:3001
   \`\`\`

4. **Build the application**

   \`\`\`bash
   npm run build
   \`\`\`

5. **Start the production server**

   \`\`\`bash
   npm start
   \`\`\`

6. **Using a reverse proxy (recommended)**

   For production deployments, it's recommended to use a reverse proxy like Nginx:

   ```nginx
   server {
       listen 80;
       server_name your-ssh-web3-app.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   \`\`\`

## Security Considerations

1. **Always use SSL/TLS**
   - Enable SSL for both the daemon and web application in production
   - Use valid certificates from a trusted CA

2. **Restrict access to the daemon**
   - Configure `allowedOrigins` to only include your web application's domain
   - Use `authorizedAddresses` to restrict access to specific wallet addresses
   - Consider using a firewall to restrict access to the daemon port

3. **Secure your private keys**
   - Never store SSH private keys in the web application
   - Consider using SSH key authentication instead of passwords

4. **Regular updates**
   - Keep both the daemon and web application updated with security patches

## Troubleshooting

### Daemon Issues

1. **Connection refused**
   - Check if the daemon is running: `systemctl status ssh-web3-daemon` (Linux) or Services app (Windows)
   - Verify the port is not blocked by a firewall
   - Check if the correct port is configured in both daemon and web application

2. **Authentication errors**
   - Verify the wallet address is correctly authorized in the daemon config
   - Check the signature verification process

3. **SSH connection failures**
   - Verify SSH credentials are correct
   - Check if the target SSH server is reachable from the daemon

### Web Application Issues

1. **Cannot connect to daemon**
   - Verify the `NEXT_PUBLIC_DAEMON_URL` is correct
   - Check if the daemon is running and accessible
   - Verify CORS settings in the daemon config

2. **Web3 wallet connection issues**
   - Check browser console for errors
   - Verify the wallet is properly configured

## Support and Contributions

For support, please open an issue on the GitHub repository. Contributions are welcome through pull requests.

## License

This project is open source and available under the MIT License.
