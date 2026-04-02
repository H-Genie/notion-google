import { pool } from "./db"

export async function getAdminByApiKey(
  apiKey: string | undefined
): Promise<{ id: number; username: string } | null> {
  if (!apiKey || typeof apiKey !== "string" || apiKey.length < 64) {
    return null
  }
  const client = await pool.connect()
  try {
    const { rows } = await client.query(
      "SELECT id, username FROM admin WHERE api_key = $1",
      [apiKey.trim()]
    )
    return rows.length > 0 ? rows[0] : null
  } finally {
    client.release()
  }
}
