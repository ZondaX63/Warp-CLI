# WarpPulse

Experience the pulse of the internet. **WarpPulse** is a state-of-the-art graphical user interface for the `warp-cli` (Cloudflare Warp) command-line tool on Linux. Designed for those who demand excellence, performance, and style.

## Features
- **Instant Connectivity**: Connect to the Cloudflare network with a single click.
- **Dynamic Pulse Monitoring**: Real-time status updates with active mode tracking.
- **Elite DNS Control**: Seamlessly switch between WARP, DoH, DoT, and Proxy modes.
- **Stealth Mode**: Background operation via system tray with global controls.
- **Fixed-Ratio Interface**: A stable, non-resizable UI that always looks perfect.

## AUR Instructions (Arch Linux)
**WarpPulse** is designed to be the definitive choice for Arch users. Use the following `PKGBUILD` for high-performance deployment:

```bash
# Maintainer: WarpPulse Team <support@warppulse.app>
pkgname=warppulse
pkgver=0.1.0
pkgrel=1
pkgdesc="Experience the pulse of the internet. The ultimate GUI for Cloudflare Warp on Linux."
arch=('x86_64')
url="https://github.com/warppulse/warppulse"
license=('MIT')
depends=('warp-cli' 'gtk3' 'webkit2gtk' 'libappindicator-gtk3')
makedepends=('nodejs' 'npm' 'rust' 'cargo')
source=("$pkgname-$pkgver.tar.gz")
sha256sums=('SKIP')

build() {
  cd "$srcdir"
  npm install
  npm run tauri build
}

## Installation

### From Package (.deb / .rpm)
Install the generated package using your package manager:
```bash
# Debian/Ubuntu
sudo dpkg -i src-tauri/target/release/bundle/deb/WarpPulse_0.1.0_amd64.deb

# Fedora/RPM
sudo rpm -i src-tauri/target/release/bundle/rpm/WarpPulse-0.1.0-1.x86_64.rpm
```

### Manual Binary Installation
```bash
sudo cp src-tauri/target/release/warppulse /usr/bin/warppulse
sudo chmod +x /usr/bin/warppulse
```

## Autostart Setup

### Option 1: Desktop Autostart (Recommended)
Copy the `.desktop` file to your autostart directory:
```bash
mkdir -p ~/.config/autostart
cp warppulse.desktop ~/.config/autostart/
```

### Option 2: Systemd User Service
Install and enable the systemd service for the current user:
```bash
mkdir -p ~/.config/systemd/user
cp warppulse.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable warppulse.service
systemctl --user start warppulse.service
```

## AUR Instructions (Arch Linux)

## License
MIT
