
import dotenv from 'dotenv'
import express from 'express'
import next from './controllers/next.controller'

dotenv.config()

const PORT = process.env.PORT != null ? parseInt(process.env.PORT) : 3000

async function main (): Promise<void> {
  const app = express()

  app.use(await next())

  return await new Promise(resolve => {
    app.listen(PORT, () => resolve())
  })
}

main()
  .then(() => console.log(`Server listening on port ${PORT}`))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
