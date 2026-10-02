import type { CommitteePerson } from './data'
import type { CommitteeMember } from '@/components/Committee'
import { mediaUrl } from './media'

export const toCommittee = (people: CommitteePerson[]): CommitteeMember[] =>
  people.map((p) => ({
    id: p.id,
    name: p.name,
    position: p.position,
    group: p.group,
    team: p.team,
    photo: mediaUrl(p.photo, 'thumb'),
    photoLarge: mediaUrl(p.photo, 'card'),
    linkedin: p.linkedin,
  }))
