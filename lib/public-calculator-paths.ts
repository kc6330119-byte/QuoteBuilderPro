type PublicCalculatorPathInput = {
  publicId: string;
  slug: string;
};

export function buildPublicQuotePath({ publicId, slug }: PublicCalculatorPathInput) {
  return `/quote/${encodeURIComponent(publicId)}/${encodeURIComponent(slug)}`;
}

export function buildPublicEmbedPath({ publicId, slug }: PublicCalculatorPathInput) {
  return `/embed/${encodeURIComponent(publicId)}/${encodeURIComponent(slug)}`;
}

export function buildPublicCalculatorFrameKey({ publicId, slug }: PublicCalculatorPathInput) {
  return `${publicId}/${slug}`;
}
