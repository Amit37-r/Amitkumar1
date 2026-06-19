import { TPlatform, TPostType } from '../../common/types';

export interface IPostRequest {
  text: string;
  platform: TPlatform;
  type: TPostType;
}

export interface IPostResult {
  success: boolean;
  platform: string;
  postedAt: Date;
  error?: string;
}

export interface IPostHistoryEntry {
  id: number;
  date: string;
  platform: string;
  postType: string;
  text: string;
  postedAt: string;
}
