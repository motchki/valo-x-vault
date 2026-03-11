import express from "express";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "valoxvault-secret-key-123";

const MOCK_CROSSHAIRS = [
  { 
    id: '1', name: 'Laser Dot', code: '0;P;o;1;d;1', author: 'TenZ', type: 'dot', color: '#ff0000', 
    outlines: true, outlineOpacity: 1, outlineThickness: 1,
    centerDot: true, dotOpacity: 1, dotThickness: 2,
    innerLines: false, outerLines: false 
  },
  { 
    id: '2', name: 'Asuna Dynamic', code: '0;s;1;P;o;1', author: 'Asuna', type: 'plus', color: '#00ff00', 
    outlines: true, outlineOpacity: 1, outlineThickness: 1,
    centerDot: false, 
    innerLines: true, innerOpacity: 1, innerLength: 4, innerThickness: 2, innerOffset: 2,
    outerLines: false 
  },
  { 
    id: '3', name: 'Simple Plus', code: '0;P;c;5;o;1', author: 'cNed', type: 'plus', color: '#00ffff', 
    outlines: true, outlineOpacity: 1, outlineThickness: 1,
    centerDot: false,
    innerLines: true, innerOpacity: 1, innerLength: 6, innerThickness: 2, innerOffset: 3,
    outerLines: false 
  },
  { 
    id: '4', name: 'Small Dot', code: '0;P;c;1;o;1;d;1;z;1', author: 'Sacy', type: 'dot', color: '#ffffff', 
    outlines: true, outlineOpacity: 1, outlineThickness: 1,
    centerDot: true, dotOpacity: 1, dotThickness: 1,
    innerLines: false, outerLines: false 
  },
  { 
    id: '5', name: 'Classic Green', code: '0;P;c;1;o;1;0t;1;0l;4;0o;2;0a;1;0f;0;1b;0', author: 'ScreaM', type: 'plus', color: '#00ff00', 
    outlines: true, outlineOpacity: 1, outlineThickness: 1,
    centerDot: false,
    innerLines: true, innerOpacity: 1, innerLength: 4, innerThickness: 1, innerOffset: 2,
    outerLines: false 
  },
  { 
    id: '6', name: 'Cyan Cross', code: '0;P;c;5;h;0;0l;4;0o;2;0a;1;0f;0;1b;0', author: 'yay', type: 'plus', color: '#00ffff', 
    outlines: false,
    centerDot: false,
    innerLines: true, innerOpacity: 1, innerLength: 4, innerThickness: 2, innerOffset: 2,
    outerLines: false 
  },
  { 
    id: '7', name: 'White Box', code: '0;P;o;1;d;1;z;4;0b;0;1b;0', author: 'Boaster', type: 'dot', color: '#ffffff', 
    outlines: true, outlineOpacity: 1, outlineThickness: 1,
    centerDot: true, dotOpacity: 1, dotThickness: 4,
    innerLines: false, outerLines: false 
  },
  { 
    id: '8', name: 'Yellow Star', code: '0;P;c;4;h;0;0l;3;0o;2;0a;1;0f;0;1t;3;1l;1;1o;1;1a;1;1m;0;1f;0', author: 'FNS', type: 'plus', color: '#ffff00', 
    outlines: false,
    centerDot: false,
    innerLines: true, innerOpacity: 1, innerLength: 3, innerThickness: 2, innerOffset: 2,
    outerLines: true, outerOpacity: 1, outerLength: 1, outerThickness: 3, outerOffset: 1 
  }
];

const MOCK_PRO_PROFILES = [
  { id: 1, name: "TenZ", team: "Sentinels", role: "Duelist", image_url: "https://picsum.photos/seed/tenz/400/400", crosshair_code: "0;P;c;5;h;0;m;1;0l;4;0o;2;0a;1;0f;0;1b;0" },
  { id: 2, name: "Aspas", team: "Leviatán", role: "Duelist", image_url: "https://picsum.photos/seed/aspas/400/400", crosshair_code: "0;P;c;5;o;1;d;1;z;3;f;0;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0" },
  { id: 3, name: "Boaster", team: "Fnatic", role: "Controller", image_url: "https://picsum.photos/seed/boaster/400/400", crosshair_code: "0;P;c;1;o;1;d;1;0l;0;0o;2;0a;1;0f;0;1b;0" },
  { id: 4, name: "cNed", team: "FUT", role: "Duelist", image_url: "https://picsum.photos/seed/cned/400/400", crosshair_code: "0;P;c;5;o;1;d;1;z;3;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0" },
  { id: 5, name: "Derke", team: "Fnatic", role: "Duelist", image_url: "https://picsum.photos/seed/derke/400/400", crosshair_code: "0;P;c;1;o;1;d;1;0l;0;0o;2;0a;1;0f;0;1b;0" },
  { id: 6, name: "Chronicle", team: "Fnatic", role: "Initiator", image_url: "https://picsum.photos/seed/chronicle/400/400", crosshair_code: "0;P;c;1;o;1;d;1;0l;0;0o;2;0a;1;0f;0;1b;0" },
  { id: 7, name: "Demon1", team: "NRG", role: "Duelist", image_url: "https://picsum.photos/seed/demon1/400/400", crosshair_code: "0;P;c;1;o;1;d;1;0l;0;0o;2;0a;1;0f;0;1b;0" },
  { id: 8, name: "Less", team: "LOUD", role: "Sentinel", image_url: "https://picsum.photos/seed/less/400/400", crosshair_code: "0;P;c;8;u;000000FF;o;1;b;1;f;0;0t;1;0l;2;0v;2;0g;1;0o;2;0a;1;0f;0;1b;0" },
  { id: 9, name: "Alfajer", team: "Fnatic", role: "Sentinel", image_url: "https://picsum.photos/seed/alfajer/400/400", crosshair_code: "0;P;c;5;o;1;d;1;z;3;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0" },
  { id: 10, name: "yay", team: "Bleed", role: "Duelist", image_url: "https://picsum.photos/seed/yay/400/400", crosshair_code: "0;P;h;0;0l;4;0o;0;0a;1;0f;0;1b;0" },
  { id: 11, name: "ScreaM", team: "Karmine Corp", role: "Duelist", image_url: "https://picsum.photos/seed/scream/400/400", crosshair_code: "0;P;c;5;o;1;d;1;z;3;0b;0;1b;0" },
  { id: 12, name: "nAts", team: "Liquid", role: "Sentinel", image_url: "https://picsum.photos/seed/nats/400/400", crosshair_code: "0;P;c;1;o;1;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0" },
  { id: 13, name: "FNS", team: "NRG", role: "Controller", image_url: "https://picsum.photos/seed/fns/400/400", crosshair_code: "0;P;c;1;o;1;0l;3;0o;2;0a;1;0f;0;1b;0" },
  { id: 14, name: "Zekken", team: "Sentinels", role: "Duelist", image_url: "https://picsum.photos/seed/zekken/400/400", crosshair_code: "0;P;c;1;o;1;d;1;0b;0;1b;0" },
  { id: 15, name: "Something", team: "Paper Rex", role: "Duelist", image_url: "https://picsum.photos/seed/something/400/400", crosshair_code: "0;P;o;0.699;d;1;f;0;s;0;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0" }
];

const db = new Database('database.sqlite');
db.pragma('journal_mode = WAL');

// Initialize DB tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS crosshairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    author TEXT,
    type TEXT,
    color TEXT,
    outlines INTEGER,
    outline_opacity REAL,
    outline_thickness INTEGER,
    center_dot INTEGER,
    dot_opacity REAL,
    dot_thickness INTEGER,
    inner_lines INTEGER,
    inner_opacity REAL,
    inner_length INTEGER,
    inner_thickness INTEGER,
    inner_offset INTEGER,
    outer_lines INTEGER,
    outer_opacity REAL,
    outer_length INTEGER,
    outer_thickness INTEGER,
    outer_offset INTEGER,
    vault_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vaults (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    owner_id INTEGER REFERENCES users(id),
    invite_code TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vault_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vault_id INTEGER REFERENCES vaults(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vault_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS pro_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    team TEXT,
    role TEXT,
    image_url TEXT,
    crosshair_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Pro Profiles if empty
const proCount = db.prepare("SELECT count(*) as count FROM pro_profiles").get() as { count: number };
if (proCount.count === 0) {
  const insertPro = db.prepare("INSERT INTO pro_profiles (name, team, role, image_url, crosshair_code) VALUES (?, ?, ?, ?, ?)");
  const insertManyPros = db.transaction((profiles) => {
    for (const p of profiles) insertPro.run(p.name, p.team, p.role, p.image_url, p.crosshair_code);
  });
  insertManyPros(MOCK_PRO_PROFILES);
}

// Seed Crosshairs if empty
const crosshairCount = db.prepare("SELECT count(*) as count FROM crosshairs").get() as { count: number };
if (crosshairCount.count === 0) {
  const insertCrosshair = db.prepare(`
    INSERT INTO crosshairs (
      name, code, author, type, color, 
      outlines, outline_opacity, outline_thickness,
      center_dot, dot_opacity, dot_thickness,
      inner_lines, inner_opacity, inner_length, inner_thickness, inner_offset,
      outer_lines, outer_opacity, outer_length, outer_thickness, outer_offset
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertManyCrosshairs = db.transaction((crosshairs) => {
    for (const c of crosshairs) {
      insertCrosshair.run(
        c.name, c.code, c.author, c.type, c.color,
        c.outlines ? 1 : 0, c.outlineOpacity || 1, c.outlineThickness || 1,
        c.centerDot ? 1 : 0, c.dotOpacity || 1, c.dotThickness || 2,
        c.innerLines ? 1 : 0, c.innerOpacity || 1, c.innerLength || 6, c.innerThickness || 2, c.innerOffset || 3,
        c.outerLines ? 1 : 0, c.outerOpacity || 0.5, c.outerLength || 2, c.outerThickness || 2, c.outerOffset || 10
      );
    }
  });
  insertManyCrosshairs(MOCK_CROSSHAIRS);
}

// Middleware to authenticate JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- Status Route ---
  app.get("/api/status", (req, res) => {
    res.json({ 
      database: "connected",
      mode: "production"
    });
  });

  // --- Auth Routes ---

  app.post("/api/auth/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      try {
        const stmt = db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
        const info = stmt.run(username, hashedPassword);
        const user = { id: info.lastInsertRowid, username };
        
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "24h" });
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
        res.json(user);
      } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: "Username already exists" });
        }
        throw err;
      }
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
      
      if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "24h" });
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      res.json({ id: user.id, username: user.username });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json(req.user);
  });

  // --- API Routes ---

  app.get("/api/crosshairs", async (req, res) => {
    const { vaultId } = req.query;
    try {
      let query = "SELECT * FROM crosshairs";
      let params: any[] = [];
      if (vaultId) {
        query += " WHERE vault_id = ?";
        params.push(vaultId);
      } else {
        query += " WHERE vault_id IS NULL";
      }
      query += " ORDER BY created_at DESC";
      
      const rows = db.prepare(query).all(...params) as any[];
      const mapped = rows.map(row => ({
        id: row.id,
        name: row.name,
        code: row.code,
        author: row.author,
        type: row.type,
        color: row.color,
        outlines: !!row.outlines,
        outlineOpacity: row.outline_opacity,
        outlineThickness: row.outline_thickness,
        centerDot: !!row.center_dot,
        dotOpacity: row.dot_opacity,
        dotThickness: row.dot_thickness,
        innerLines: !!row.inner_lines,
        innerOpacity: row.inner_opacity,
        innerLength: row.inner_length,
        innerThickness: row.inner_thickness,
        innerOffset: row.inner_offset,
        outerLines: !!row.outer_lines,
        outerOpacity: row.outer_opacity,
        outerLength: row.outer_length,
        outerThickness: row.outer_thickness,
        outerOffset: row.outer_offset,
        vaultId: row.vault_id,
        created_at: row.created_at
      }));
      return res.json(mapped);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/crosshairs", authenticateToken, async (req: any, res) => {
    const { 
      name, code, type, color, 
      outlines, outlineOpacity, outlineThickness,
      centerDot, dotOpacity, dotThickness,
      innerLines, innerOpacity, innerLength, innerThickness, innerOffset,
      outerLines, outerOpacity, outerLength, outerThickness, outerOffset,
      vaultId 
    } = req.body;
    const author = req.user.username;
    try {
      const stmt = db.prepare(`
        INSERT INTO crosshairs (
          name, code, author, type, color, 
          outlines, outline_opacity, outline_thickness,
          center_dot, dot_opacity, dot_thickness,
          inner_lines, inner_opacity, inner_length, inner_thickness, inner_offset,
          outer_lines, outer_opacity, outer_length, outer_thickness, outer_offset,
          vault_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const info = stmt.run(
        name, code, author, type || 'plus', color || '#ffffff', 
        outlines ? 1 : 0, outlineOpacity ?? 1, outlineThickness ?? 1,
        centerDot ? 1 : 0, dotOpacity ?? 1, dotThickness ?? 2,
        innerLines ? 1 : 0, innerOpacity ?? 1, innerLength ?? 6, innerThickness ?? 2, innerOffset ?? 3,
        outerLines ? 1 : 0, outerOpacity ?? 0.5, outerLength ?? 2, outerThickness ?? 2, outerOffset ?? 10,
        vaultId || null
      );
      
      const newCrosshair = db.prepare("SELECT * FROM crosshairs WHERE id = ?").get(info.lastInsertRowid);
      return res.json(newCrosshair);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // --- Vault Routes ---

  app.get("/api/vaults", authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    try {
      const rows = db.prepare(`
        SELECT v.* FROM vaults v
        JOIN vault_members vm ON v.id = vm.vault_id
        WHERE vm.user_id = ?
        ORDER BY v.created_at DESC
      `).all(userId);
      return res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/vaults", authenticateToken, async (req: any, res) => {
    const { name } = req.body;
    const userId = req.user.id;
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      const insertVault = db.prepare("INSERT INTO vaults (name, owner_id, invite_code) VALUES (?, ?, ?)");
      const insertMember = db.prepare("INSERT INTO vault_members (vault_id, user_id) VALUES (?, ?)");
      
      const transaction = db.transaction(() => {
        const info = insertVault.run(name, userId, inviteCode);
        const vaultId = info.lastInsertRowid;
        insertMember.run(vaultId, userId);
        return db.prepare("SELECT * FROM vaults WHERE id = ?").get(vaultId);
      });
      
      const vault = transaction();
      return res.json(vault);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/vaults/join", authenticateToken, async (req: any, res) => {
    const { inviteCode } = req.body;
    const userId = req.user.id;

    try {
      const vault = db.prepare("SELECT id FROM vaults WHERE invite_code = ?").get(inviteCode) as any;
      if (!vault) return res.status(404).json({ error: "Vault not found" });
      
      try {
        db.prepare("INSERT INTO vault_members (vault_id, user_id) VALUES (?, ?)").run(vault.id, userId);
      } catch (err: any) {
        if (err.code !== 'SQLITE_CONSTRAINT_UNIQUE') throw err;
        // Ignore if already joined
      }
      
      return res.json({ message: "Joined successfully", vaultId: vault.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/pro-profiles", async (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM pro_profiles ORDER BY name ASC").all();
      return res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // --- Vite Integration ---

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
