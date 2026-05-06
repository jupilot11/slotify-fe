import type { User } from '@/types'

export const mockUsers: User[] = [
  {
    id: 'user_1',
    email: 'owner@slotify.com',
    name: 'Alex Johnson',
    role: 'owner',
    businessId: 'biz_1',
  },
  {
    id: 'user_2',
    email: 'staff@slotify.com',
    name: 'Maria Garcia',
    role: 'staff',
    businessId: 'biz_1',
  },
  {
    id: 'user_admin',
    email: 'admin@slotify.com',
    name: 'System Admin',
    role: 'admin',
  },
]

export const mockCurrentUser: User = mockUsers[0]
