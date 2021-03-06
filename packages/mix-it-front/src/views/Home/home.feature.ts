import { googleService, partyService } from '@front/services'
import { Party } from '@front/models/party'

export default function useHome() {
  async function createParty(): Promise<Party> {
    const user = await googleService.getCurrentGoogleUser()
    return partyService.create({ owner: user.getId() })
  }

  return {
    createParty
  }
}
