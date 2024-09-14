export default function formatTimestampToTime(timestamp:{seconds:number,nanoseconds:number}) {
    // Convert Firestore timestamp (seconds + nanoseconds) to milliseconds
    if(timestamp && timestamp.seconds && timestamp.nanoseconds){
    const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
  
    // Create a JavaScript Date object from the milliseconds
    const date = new Date(milliseconds);
  
    // Format the time as "10:30 PM" using toLocaleTimeString with options
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return date.toLocaleTimeString('en-US', options);
}
return ""
  }
  