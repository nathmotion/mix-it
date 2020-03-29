import { googleService } from '@/services'
import { ref } from '@vue/composition-api'

export default function useGoogleAuth() {
  const isSignIn = ref(false)
  const googleSignInAPI = document.createElement('script')
  googleSignInAPI.setAttribute('src', 'https://apis.google.com/js/api:client.js')
  document.head.appendChild(googleSignInAPI)

  async function init() {
    await googleService.init()
    const currentUser = await googleService.getCurrentUser()
    currentUser.listen(async () => {
      isSignIn.value = await googleService.isSignIn()
    })
  }

  googleSignInAPI.onload = init

  async function signIn() {
    await googleService.signIn()
    isSignIn.value = true
  }

  async function signOut() {
    await googleService.signOut()
    isSignIn.value = false
  }

  return { isSignIn, signIn, signOut }
}
