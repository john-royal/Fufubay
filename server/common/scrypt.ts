import * as assert from 'assert'
import * as crypto from 'crypto'

const KEY_LENGTH = 64
const SALT_LENGTH = 16

async function scrypt (password: string, salt: string): Promise<string> {
  return await new Promise(resolve => {
    crypto.scrypt(password, salt, KEY_LENGTH, (error, hash) => {
      assert.strictEqual(error, null)
      resolve(hash.toString('hex'))
    })
  })
}

export async function hash (password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex')
  const key = await scrypt(password, salt)
  return `${salt}:${key}`
}

export async function compare (password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(':')
  const generatedKey = await scrypt(password, salt)
  return key === generatedKey
}
