import axios, { AxiosInstance } from 'axios'
import socketio from 'socket.io-client'

import { Party, Playlist } from '@/models'

interface PartyOptions {
  owner: string
}

interface OnPlaylistCallback {
  (playlist: Playlist): void
}

export interface PartyService {
  join(partyId: string): Promise<void>
  leave(partyId: string): Promise<void>
  submitSong(songId: string): Promise<void>
  onPlaylist(cb: OnPlaylistCallback): void
}

class PartyServiceImpl implements PartyService {
  private readonly api: AxiosInstance

  private readonly socket: SocketIOClient.Socket

  constructor({ baseURL }) {
    this.api = axios.create({ baseURL })
    this.socket = socketio(`${baseURL}/parties`)
  }

  join(partyId: string): Promise<void> {
    return new Promise((resolve) => {
      this.socket.emit('room:join', { partyId, clientType: 'client' }, resolve)
    })
  }

  leave(partyId: string): Promise<void> {
    return new Promise((resolve) => {
      this.socket.emit('room:leave', resolve)
    })
  }

  submitSong(songId: string): Promise<void> {
    return new Promise((resolve) => {
      this.socket.emit('song:submit', songId, resolve)
    })
  }

  onPlaylist(cb: OnPlaylistCallback): void {
    this.socket.on('playlist', cb)
  }
}

export interface PartyServiceOptions {
  baseURL: string
}

export function createPartyService(opts: PartyServiceOptions): PartyService {
  return new PartyServiceImpl(opts)
}

export default PartyService