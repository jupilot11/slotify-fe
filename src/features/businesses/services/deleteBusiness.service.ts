import { invokeEdgeFunction } from '@/lib/supabase/invoke'

interface DeleteBusinessResponse {
  success: boolean
  message: string
}

export async function deleteBusiness(id: string): Promise<void> {
  const result = await invokeEdgeFunction<DeleteBusinessResponse>(`manage-business/${id}`, {
    method: 'DELETE',
  })
  if (!result.success) throw new Error('Failed to delete business')
}
