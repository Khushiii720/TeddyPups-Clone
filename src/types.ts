export interface Media {
  id: string; url: string; kind: string; width: number; height: number;
  alt: string; caption: string; focalX: number; focalY: number;
  color: string; poster?: Media | null;
}
export interface Puppy {
  slug: string; displayName: string; name: string; breed: string;
  gender?: string; genderLabel: string; age: string; status: string;
  origin?: {slug: string}; breeds?: {slug: string; name: string}[];
  collections?: {slug: string}[]; cover: Media; media: Media[];
}
