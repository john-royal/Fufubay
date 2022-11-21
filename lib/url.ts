export function auctionURL ({ id, slug }: { id: number, slug: string }): string {
  return `/auctions/${id}/${slug}`
}

export function userURL ({ id, username }: { id: number, username: string }): string {
  return `/users/${id}/${username}`
}
