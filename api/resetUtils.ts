export function addOneMonth(date: Date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d;
}

export function formatTimeDiff(target: Date) {
  const now = new Date();
  let diff = target.getTime() - now.getTime();

  if (diff <= 0) return "0 s";

  const sec = 1000;
  const min = sec * 60;
  const hour = min * 60;
  const day = hour * 24;
  const month = day * 30; 

  const months = Math.floor(diff / month); diff -= months * month;
  const days = Math.floor(diff / day); diff -= days * day;
  const hours = Math.floor(diff / hour); diff -= hours * hour;
  const minutes = Math.floor(diff / min); diff -= minutes * min;
  const seconds = Math.floor(diff / sec);

  let parts: string[] = [];

  parts.push(`${months} mo`);
  parts.push(`${days} d`);
  parts.push(`${hours} h`);
  parts.push(`${minutes} min`);
  parts.push(`${seconds} s`);

  return parts.join(" ");
}
