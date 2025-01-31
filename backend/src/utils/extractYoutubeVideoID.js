export const extractVideoId = (url) => {
    const regex = /(?:v=|be\/|v\/|embed\/|shorts\/)([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };