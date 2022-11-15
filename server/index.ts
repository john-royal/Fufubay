
import dotenv from 'dotenv'
import express from 'express'
import next from 'next'
import { parse } from 'url' // eslint-disable-line n/no-deprecated-api
import api from './api'

dotenv.config()

const PORT = process.env.PORT != null ? parseInt(process.env.PORT) : 3000

const app = next({ dev: process.env.NODE_ENV !== 'production' })
const handler = app.getRequestHandler()

async function main (): Promise<void> {
  const server = express()

  server.use('/api', api)
  server.use((req, res, next) => {
    const url = parse(req.url, true)
    handler(req, res, url)
      .then(() => next())
      .catch(err => next(err))
  })

  await app.prepare()

  return await new Promise(resolve => {
    server.listen(PORT, () => resolve())
  })
}

main()
  .then(() => console.log(`Server listening on port ${PORT}`))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
