# Trawl Mail

![Trawl Mail](app-icon.png)

A local SMTP testing server for developers. Trawl Mail catches every email your application sends, allowing you to test
and debug email functionality without ever hitting a real inbox.

## Why Trawl Mail?

Testing email-sending code is a pain. You either:

- Accidentally spam real users during development
- Configure a real SMTP service just for testing
- Dig through log files trying to verify email content

Trawl Mail runs a local catch-all SMTP server that intercepts every outgoing email and displays it in a clean,
searchable interface. No real emails sent. No external services needed. Just instant feedback.

## Features

- **Catch-All SMTP Server** - Accepts every email on a configurable port
- **Real-Time Capture** - Emails appear instantly as your app sends them
- **HTML & Plain Text Viewing** - Toggle between rendered HTML and raw source
- **Attachment Inspection** - View and download all attachments
- **Header Analysis** - Inspect full email headers for deliverability debugging
- **Search & Filter** - Find emails by subject, recipient, sender, or content
- **Dark Mode** - Easy on the eyes during late-night debugging sessions
- **Export Support** - Save individual emails as `.eml` files
- **Minimal Footprint** - Runs quietly in your system tray
- **Tiny Bundle Size** - Built with Tauri for a lightweight native experience

## Installation

### Download

Get the latest version from the [Releases](https://github.com/yourusername/trawl-mail/releases) page.

**Platforms:**

- Windows (`.msi`, `.exe`)
- macOS (`.dmg`)
- Linux (`.AppImage`, `.deb`, `.rpm`)

### Or Build from Source

**Prerequisites:** [Rust](https://www.rust-lang.org/tools/install), [Node.js](https://nodejs.org/),
and [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

```bash
git clone https://github.com/yourusername/trawl-mail.git
cd trawl-mail
npm install
npm run tauri build
```

The compiled binary will be in `src-tauri/target/release/`.

## Quick Start

1. **Launch Trawl Mail** - The SMTP server starts on port `2525` (configurable)
2. **Point your app to Trawl Mail:**

```
SMTP Host: localhost
SMTP Port: 1025
Username:  (leave blank)
Password:  (leave blank)
Encryption: None
```

3. **Send a test email from your app**
4. **Watch it appear instantly in Trawl Mail's inbox**

## Configuration

| Setting         | Default | Description                                                      |
|-----------------|---------|------------------------------------------------------------------|
| SMTP Port       | `2525`  | Port for the SMTP server (use `1025` to avoid admin permissions) |
| Max Emails      | `500`   | Maximum emails stored before oldest are purged                   |
| Auto Start      | `true`  | Start SMTP server on app launch                                  |
| Start Minimized | `false` | Start Trawl Mail minimized to system tray                        |

Settings can be changed from **Preferences → Server Settings**.

## Example Integrations

### Node.js (Nodemailer)

```javascript
const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    secure: false,
    ignoreTLS: true
});
```

### Python (smtplib)

```python
import smtplib
server = smtplib.SMTP('localhost', 1025)
server.sendmail('from@test.com', 'to@test.com', 'Test message')
```

### Laravel (.env)

```
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

### Ruby on Rails (Action Mailer)

```ruby
# config/environments/development.rb
config.action_mailer.delivery_method = :smtp
config.action_mailer.smtp_settings = {
  address: 'localhost',
  port: 1025
}
```

## Troubleshooting

**Port already in use?**
Other SMTP services (like Postfix or Sendmail) might be using port 25. Change Trawl Mail's SMTP port in Preferences →
Server Settings.

**Firewall blocking connections?**
Ensure your firewall allows connections to `localhost:1025`. Some firewall software may prompt you to allow Trawl Mail
on first launch.

**Emails not appearing?**
Check that your application is actually connecting to Trawl Mail's port. Verify the SMTP configuration in your app
matches the port shown in Trawl Mail's status bar. Check the Trawl Mail logs via **View → Developer Tools**.

**Linux AppImage won't run?**
Make sure the AppImage is executable: `chmod +x trawl-mail.AppImage`

## Tech Stack

- **Desktop Framework:** [Tauri](https://tauri.app/) (Rust backend)
- **Frontend:** Svelte, Tailwind CSS
- **SMTP Server:** Custom Rust-based SMTP server (using `tokio` and `async-smtp`)
- **Email Parsing:** `mail-parser` (Rust)
- **Storage:** SQLite (via `rusqlite`)

## Why Tauri?

Trawl Mail is built with Tauri for a reason:

- **Tiny bundle size** — ~5 MB compared to 100+ MB with Electron
- **Low memory usage** — Idles at ~20 MB RAM
- **Truly native performance** — SMTP server runs on Rust's async runtime
- **No bundled browser** — Uses the system's native webview

Your system tray will thank you.

## Contributing

Bug reports and pull requests are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

If you're interested in contributing Rust code (SMTP server improvements, performance optimizations), check out the
issues tagged `rust` and `good first issue`.

## Alternatives

- [Mailpit](https://github.com/axllent/mailpit) - Web-based with API (Go)
- [MailHog](https://github.com/mailhog/MailHog) - The original (unmaintained)
- [smtp4dev](https://github.com/rnwood/smtp4dev) - Windows-focused (.NET)

Why Trawl Mail? A lightweight, native desktop app with system tray support — no browser tabs, no Docker containers, no
command-line only interface. Just launch and go.

## License

MIT © [Your Name]

---

**Trawl Mail** — *Catch 'em all before they reach the wild.*