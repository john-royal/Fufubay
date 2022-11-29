import { ImageLoaderProps } from 'next/image'
import { APIResponse } from './request'

export interface ImageResult {
  url: string
}

export async function uploadImage<T> (url: string, image: File): Promise<T> {
  const body = new FormData()
  body.append('image', image, image.name)
  return await fetch(url, {
    method: 'PUT',
    body
  })
    .then(async response => await response.json() as APIResponse<T>)
    .then(response => {
      if (response.success) return response.data
      throw new Error(response.error.message)
    })
}

export function makeImageUrl ({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src)
  if (url.hostname !== 'csc-32200-fufubay-images.s3.amazonaws.com') {
    return src
  }
  const parameters = {
    bucket: 'csc-32200-fufubay-images',
    key: url.pathname.slice(1),
    edits: {
      resize: {
        width: width * (quality ?? 2),
        fit: 'cover'
      }
    }
  }
  const toBase64: (data: string) => string = typeof btoa === 'function' ? btoa : data => Buffer.from(data).toString('base64')
  const pathname = toBase64(JSON.stringify(parameters))

  return `https://fufubaycdn.johnmroyal.com/${pathname}`
}
