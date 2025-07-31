export interface Novel {
  id: number;
  title: string;
  author_id: number;
  publisher: string;
  cover_image_url: string;
  synopsis: string;
  genre: string;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: number;
  title: string;
  chapter_number: number;
  novel_title: string;
  created_at: string;
}
