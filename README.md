# Luma - Open Source Bot for Zyntra.gg

**Luma** is an open-source moderation and utility bot built for [Zyntra](https://zyntra.gg) by [Szymekk](https://github.com/szymekk).
It supports key features like autoroles, welcome messages, permission viewing, and much more!

You can:

- ✅ **Test it** on our official server: [https://zyntra.gg/invite/zyntra](https://zyntra.gg/invite/zyntra)
- ✅ **Add it to your own server**:
  [https://zyntra.gg/authorize/bot/7358806823119360002?permissions=32768](https://zyntra.gg/authorize/bot/7358806823119360002?permissions=32768)

---

## ⚙️ Features

- ✅ Autorole system – auto-assign roles to new users when they join
- ✅ Welcome messages – greet new members with a custom message in a chosen channel (fully customizable)
- ✅ Command prefix customization
- ✅ Check user permissions
- ✅ Simple help embed creator
- ✅ Full permission system – respects and checks users' permissions and role priorities
- 🔌 Built in JavaScript using native REST API calls to Zyntra (no external SDK required)
- 🧠 Built-in cache for servers and members to reduce API calls
- 🚦 Internal message rate limiter to avoid hitting Zyntra's API rate limits (fully adjustable)

---

## 🧪 Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/Szymekk44/Luma.git
   cd Luma
   ```

2. Create a `.env` file in the root directory (same folder as `src`):

   ```
   BOT_TOKEN=Bot <your_token_from_https://developer.zyntra.gg>
   MONGODB_URI=mongodb+srv://<your-mongo-uri>
   ```
> [!NOTE]
> *We recommend using a free MongoDB cluster. Each server document is just a few KB with indexes.*

3. Install dependencies:

   ```bash
   npm install
   ```
   
4. Start the bot:

   ```bash
   npm start
   ```

---

## 🧵 Commands Overview

- `/autorole` — Configure automatic role assignment
- `/welcome` — Set up welcome messages
- `/prefix` — Change the bot prefix for your server
- `/perms` — Check a user’s permissions
- `/help` — View all available commands

---

## 🤝 Contributing

Pull requests are welcome! Feel free to fork the project and improve it.
Whether it's fixing bugs, improving performance, or adding new features — contributions are appreciated.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
