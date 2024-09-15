export default function getFileCategory(mimeType:string) {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }else if(mimeType.startsWith('video/')){
    return 'video'
  }
  else if(mimeType.startsWith('audio/webm')){
    return 'audio'
  }
  else if(mimeType.startsWith('audio/')){
    return 'audio'
  }else if (mimeType.startsWith('application/')) {
    return 'application';
  } else if (mimeType.startsWith('text/')) {
    return 'text';
  } 
  else {
    return 'other';
  }
}
