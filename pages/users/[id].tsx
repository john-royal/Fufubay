import { User } from '@prisma/client'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import Stripe from 'stripe'
import { get } from '../../lib/request'

interface UserWithStripe extends User {
  stripeCustomer?: Stripe.Customer
}

export async function getServerSideProps ({ params, req }: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{ user: UserWithStripe }>> {
  if (params?.id == null || Array.isArray(params.id)) {
    return { notFound: true }
  }
  const res = await get<UserWithStripe>(`/api/users/${params.id}`, req.headers)
  if (!res.success) {
    return { notFound: true }
  }
  return {
    props: { user: res.data }
  }
}

export default function UserPage ({ user }: { user: UserWithStripe }) {
  return (
      <div className='container mt-5'>
        <h1 className='title'>{user.name}</h1>
          <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
  )
}
