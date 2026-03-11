import express from "express";
import { createServer as createViteServer } from "vite";
import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
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

// --- In-Memory Fallback Storage ---
let inMemoryUsers: any[] = [];
let inMemoryCrosshairs: any[] = [...MOCK_CROSSHAIRS];
let inMemoryVaults: any[] = [];
let inMemoryVaultMembers: any[] = [];
let isDbConnected = false;

// PostgreSQL Pool setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false }
});

// Test connection and handle failure gracefully
if (process.env.DATABASE_URL && process.env.DATABASE_URL !== "") {
  console.log("⏳ Attempting to connect to database...");
  pool.connect(async (err, client, release) => {
    if (err) {
      console.warn("⚠️ Database connection failed. Switching to In-Memory Mode.");
      console.warn("💡 Tip: Check your DATABASE_URL in Settings > Secrets. Ensure it follows the Supabase URI format.");
      console.warn("Reason:", err.message);
      isDbConnected = false;
    } else {
      console.log("✅ Database connected successfully.");
      isDbConnected = true;
      release();
      
      // Initialize DB tables once connected
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS crosshairs (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT NOT NULL,
            author TEXT,
            type TEXT,
            color TEXT,
            outlines BOOLEAN,
            outline_opacity FLOAT,
            outline_thickness INTEGER,
            center_dot BOOLEAN,
            dot_opacity FLOAT,
            dot_thickness INTEGER,
            inner_lines BOOLEAN,
            inner_opacity FLOAT,
            inner_length INTEGER,
            inner_thickness INTEGER,
            inner_offset INTEGER,
            outer_lines BOOLEAN,
            outer_opacity FLOAT,
            outer_length INTEGER,
            outer_thickness INTEGER,
            outer_offset INTEGER,
            vault_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS vaults (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            owner_id INTEGER REFERENCES users(id),
            invite_code TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS vault_members (
            id SERIAL PRIMARY KEY,
            vault_id INTEGER REFERENCES vaults(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(vault_id, user_id)
          );

          CREATE TABLE IF NOT EXISTS pro_profiles (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            team TEXT,
            role TEXT,
            image_url TEXT,
            crosshair_code TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Seed Pro Profiles if empty
        const count = await pool.query("SELECT count(*) FROM pro_profiles");
        if (parseInt(count.rows[0].count) === 0) {
          await pool.query(`
            INSERT INTO pro_profiles (name, team, role, image_url, crosshair_code) VALUES
            ('TenZ', 'Sentinels', 'Duelist', 'https://picsum.photos/seed/tenz/400/400', '0;P;c;5;h;0;m;1;0l;4;0o;2;0a;1;0f;0;1b;0'),
            ('Aspas', 'Leviatán', 'Duelist', 'https://picsum.photos/seed/aspas/400/400', '0;P;c;5;o;1;d;1;z;3;f;0;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0'),
            ('Boaster', 'Fnatic', 'Controller', 'https://picsum.photos/seed/boaster/400/400', '0;P;c;1;o;1;d;1;0l;0;0o;2;0a;1;0f;0;1b;0'),
            ('cNed', 'FUT', 'Duelist', 'https://picsum.photos/seed/cned/400/400', '0;P;c;5;o;1;d;1;z;3;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0'),
            ('Derke', 'Fnatic', 'Duelist', 'https://picsum.photos/seed/derke/400/400', '0;P;c;1;o;1;d;1;0l;0;0o;2;0a;1;0f;0;1b;0'),
            ('Chronicle', 'Fnatic', 'Initiator', 'https://picsum.photos/seed/chronicle/400/400', '0;P;c;1;o;1;d;1;0l;0;0o;2;0a;1;0f;0;1b;0'),
            ('Demon1', 'NRG', 'Duelist', 'https://picsum.photos/seed/demon1/400/400', '0;P;c;1;o;1;d;1;0l;0;0o;2;0a;1;0f;0;1b;0'),
            ('Less', 'LOUD', 'Sentinel', 'https://picsum.photos/seed/less/400/400', '0;P;c;8;u;000000FF;o;1;b;1;f;0;0t;1;0l;2;0v;2;0g;1;0o;2;0a;1;0f;0;1b;0'),
            ('Alfajer', 'Fnatic', 'Sentinel', 'https://picsum.photos/seed/alfajer/400/400', '0;P;c;5;o;1;d;1;z;3;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0'),
            ('yay', 'Bleed', 'Duelist', 'https://picsum.photos/seed/yay/400/400', '0;P;h;0;0l;4;0o;0;0a;1;0f;0;1b;0'),
            ('ScreaM', 'Karmine Corp', 'Duelist', 'https://picsum.photos/seed/scream/400/400', '0;P;c;5;o;1;d;1;z;3;0b;0;1b;0'),
            ('nAts', 'Liquid', 'Sentinel', 'https://picsum.photos/seed/nats/400/400', '0;P;c;1;o;1;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0'),
            ('FNS', 'NRG', 'Controller', 'https://picsum.photos/seed/fns/400/400', '0;P;c;1;o;1;0l;3;0o;2;0a;1;0f;0;1b;0'),
            ('Zekken', 'Sentinels', 'Duelist', 'https://picsum.photos/seed/zekken/400/400', '0;P;c;1;o;1;d;1;0b;0;1b;0'),
            ('Something', 'Paper Rex', 'Duelist', 'https://picsum.photos/seed/something/400/400', '0;P;o;0.699;d;1;f;0;s;0;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0')
          `);
        }
      } catch (dbErr) {
        console.error("Error initializing DB tables:", dbErr);
      }
    }
  });
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
      database: isDbConnected ? "connected" : "disconnected",
      mode: isDbConnected ? "production" : "demo"
    });
  });

  // --- Auth Routes ---

  app.post("/api/auth/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      let user;

      if (isDbConnected) {
        const result = await pool.query(
          "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
          [username, hashedPassword]
        );
        user = result.rows[0];
      } else {
        if (inMemoryUsers.find(u => u.username === username)) {
          return res.status(400).json({ error: "Username already exists" });
        }
        user = { id: Date.now(), username };
        inMemoryUsers.push({ ...user, password_hash: hashedPassword });
      }
      
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "24h" });
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      res.json(user);
    } catch (err: any) {
      if (err.code === "23505") return res.status(400).json({ error: "Username already exists" });
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      let user;
      if (isDbConnected) {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        user = result.rows[0];
      } else {
        user = inMemoryUsers.find(u => u.username === username);
      }
      
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
      if (isDbConnected) {
        let query = "SELECT * FROM crosshairs";
        let params: any[] = [];
        if (vaultId) {
          query += " WHERE vault_id = $1";
          params.push(vaultId);
        } else {
          query += " WHERE vault_id IS NULL";
        }
        query += " ORDER BY created_at DESC";
        const result = await pool.query(query, params);
        const mapped = result.rows.map(row => ({
          id: row.id,
          name: row.name,
          code: row.code,
          author: row.author,
          type: row.type,
          color: row.color,
          outlines: row.outlines,
          outlineOpacity: row.outline_opacity,
          outlineThickness: row.outline_thickness,
          centerDot: row.center_dot,
          dotOpacity: row.dot_opacity,
          dotThickness: row.dot_thickness,
          innerLines: row.inner_lines,
          innerOpacity: row.inner_opacity,
          innerLength: row.inner_length,
          innerThickness: row.inner_thickness,
          innerOffset: row.inner_offset,
          outerLines: row.outer_lines,
          outerOpacity: row.outer_opacity,
          outerLength: row.outer_length,
          outerThickness: row.outer_thickness,
          outerOffset: row.outer_offset,
          vaultId: row.vault_id,
          created_at: row.created_at
        }));
        return res.json(mapped);
      }
      
      let filtered = inMemoryCrosshairs;
      if (vaultId) {
        filtered = inMemoryCrosshairs.filter(c => c.vault_id === parseInt(vaultId as string));
      } else {
        filtered = inMemoryCrosshairs.filter(c => !c.vault_id);
      }
      res.json(filtered);
    } catch (err) {
      console.error("Query failed, falling back to memory:", err);
      res.json(inMemoryCrosshairs);
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
      if (isDbConnected) {
        const result = await pool.query(
          `INSERT INTO crosshairs (
            name, code, author, type, color, 
            outlines, outline_opacity, outline_thickness,
            center_dot, dot_opacity, dot_thickness,
            inner_lines, inner_opacity, inner_length, inner_thickness, inner_offset,
            outer_lines, outer_opacity, outer_length, outer_thickness, outer_offset,
            vault_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING *`,
          [
            name, code, author, type || 'plus', color || '#ffffff', 
            outlines ?? true, outlineOpacity ?? 1, outlineThickness ?? 1,
            centerDot ?? false, dotOpacity ?? 1, dotThickness ?? 2,
            innerLines ?? true, innerOpacity ?? 1, innerLength ?? 6, innerThickness ?? 2, innerOffset ?? 3,
            outerLines ?? false, outerOpacity ?? 0.5, outerLength ?? 2, outerThickness ?? 2, outerOffset ?? 10,
            vaultId || null
          ]
        );
        return res.json(result.rows[0]);
      }
      
      const newCrosshair = {
        id: Date.now().toString(),
        name, code, author, type, color, 
        outlines, outlineOpacity, outlineThickness,
        centerDot, dotOpacity, dotThickness,
        innerLines, innerOpacity, innerLength, innerThickness, innerOffset,
        outerLines, outerOpacity, outerLength, outerThickness, outerOffset,
        vault_id: vaultId ? parseInt(vaultId) : null,
        created_at: new Date().toISOString()
      };
      inMemoryCrosshairs.unshift(newCrosshair);
      res.json(newCrosshair);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // --- Vault Routes ---

  app.get("/api/vaults", authenticateToken, async (req: any, res) => {
    const userId = req.user.id;
    try {
      if (isDbConnected) {
        const result = await pool.query(`
          SELECT v.* FROM vaults v
          JOIN vault_members vm ON v.id = vm.vault_id
          WHERE vm.user_id = $1
          ORDER BY v.created_at DESC
        `, [userId]);
        return res.json(result.rows);
      }
      
      const memberVaultIds = inMemoryVaultMembers
        .filter(vm => vm.user_id === userId)
        .map(vm => vm.vault_id);
      const vaults = inMemoryVaults.filter(v => memberVaultIds.includes(v.id));
      res.json(vaults);
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
      if (isDbConnected) {
        const result = await pool.query(
          "INSERT INTO vaults (name, owner_id, invite_code) VALUES ($1, $2, $3) RETURNING *",
          [name, userId, inviteCode]
        );
        const vault = result.rows[0];
        await pool.query(
          "INSERT INTO vault_members (vault_id, user_id) VALUES ($1, $2)",
          [vault.id, userId]
        );
        return res.json(vault);
      }
      
      const vault = { id: Date.now(), name, owner_id: userId, invite_code: inviteCode, created_at: new Date().toISOString() };
      inMemoryVaults.push(vault);
      inMemoryVaultMembers.push({ vault_id: vault.id, user_id: userId });
      res.json(vault);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/vaults/join", authenticateToken, async (req: any, res) => {
    const { inviteCode } = req.body;
    const userId = req.user.id;

    try {
      if (isDbConnected) {
        const vaultResult = await pool.query("SELECT id FROM vaults WHERE invite_code = $1", [inviteCode]);
        if (vaultResult.rows.length === 0) return res.status(404).json({ error: "Vault not found" });
        
        const vaultId = vaultResult.rows[0].id;
        await pool.query(
          "INSERT INTO vault_members (vault_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [vaultId, userId]
        );
        return res.json({ message: "Joined successfully", vaultId });
      }
      
      const vault = inMemoryVaults.find(v => v.invite_code === inviteCode);
      if (!vault) return res.status(404).json({ error: "Vault not found" });
      
      if (!inMemoryVaultMembers.find(vm => vm.vault_id === vault.id && vm.user_id === userId)) {
        inMemoryVaultMembers.push({ vault_id: vault.id, user_id: userId });
      }
      res.json({ message: "Joined successfully", vaultId: vault.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/pro-profiles", async (req, res) => {
    try {
      if (isDbConnected) {
        const result = await pool.query("SELECT * FROM pro_profiles ORDER BY name ASC");
        return res.json(result.rows);
      }
      res.json(MOCK_PRO_PROFILES);
    } catch (err) {
      console.error("Database error, falling back to mock data:", err);
      res.json(MOCK_PRO_PROFILES);
    }
  });

  // --- Vite Integration ---

  if (process.env.NODE_ENV !== "production") {
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
