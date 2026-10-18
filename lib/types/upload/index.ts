export type UploadImageResult = {
  url: string;
  key: string;
};

export type DeleteImageBody = {
  url: string;
};

export type DeleteImageResult = {
  message: string;
};
