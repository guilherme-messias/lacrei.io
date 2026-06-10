export type SearchTrack = {
  musicbrainzId: string
  deezerId: string | null
  title: string
  artistName: string
  albumCoverUrl: string | null
  durationSeconds: number | null
}
