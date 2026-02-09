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

package() {
  install -Dm755 "$srcdir/src-tauri/target/release/warppulse" "$pkgdir/usr/bin/warppulse"
  # Desktop entry and icons installation logic here
}
```

## License
MIT
