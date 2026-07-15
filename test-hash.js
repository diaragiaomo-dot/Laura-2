import crypto from "crypto";

function getWikimediaPath(filename) {
  // Replace spaces with underscores and trim
  const cleanName = filename.trim().replace(/ /g, "_");
  const hash = crypto.createHash("md5").update(cleanName).digest("hex");
  const char1 = hash[0];
  const char2 = hash.slice(0, 2);
  return `https://upload.wikimedia.org/wikipedia/commons/${char1}/${char2}/${cleanName}`;
}

console.log("Laura_Pausini_live_2018.jpg path:", getWikimediaPath("Laura_Pausini_live_2018.jpg"));
console.log("Laura_Pausini_2018.jpg path:", getWikimediaPath("Laura_Pausini_2018.jpg"));
console.log("Laura_Pausini_2016_01.jpg path:", getWikimediaPath("Laura_Pausini_2016_01.jpg"));
