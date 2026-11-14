
require('dotenv').config()
const db = require('./db')

async function testDatabase() {
  try {
    const [rows] = await db.query('SELECT DATABASE() AS databaseName')
    console.log('MySQL connected successfully:', rows[0].databaseName)
  } catch (error) {
    console.error('MySQL connection failed:', error.message)
  } finally {
    await db.end()
  }
}

testDatabase()
