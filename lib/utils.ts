export function cleanPdfText(text: string): string {
  let cleaned = text;

  
  cleaned = cleaned.replace(/\n\s*\n+/g, "\n\n"); 
  cleaned = cleaned.replace(/(?<!\n)\n(?!\n)/g, " ");
  cleaned = cleaned.replace(/(\d)\s*\/\s*(\d)/g, "$1/$2");
  cleaned = cleaned.replace(/(\d)\s*:\s*(\d)/g, "$1:$2");
  cleaned = cleaned.replace(/(\d)\s*-\s*(\d)/g, "$1-$2");
  cleaned = cleaned.replace(/(\d{1,2})\s+(\d{1,2})/g, "$1$2");
  cleaned = cleaned.replace(/\b([a-zA-Z]{1,2})\s+([a-zA-Z]{2,})/g, "$1$2");
  const gluedPatterns: [RegExp, string][] = [
    [/(to)([a-z])/g, "to $2"],       
    [/(we)([a-z])/g, "we $2"], 
    [/(be)([a-z])/g, "be $2"],
    [/(of)([a-z])/g, "of $2"], 
    [/(in)([a-z])/g, "in $2"],
    [/(by)([a-z])/g, "by $2"],
    [/(on)([a-z])/g, "on $2"],
  ];

  gluedPatterns.forEach(([pattern, replacement]) => {
    cleaned = cleaned.replace(pattern, replacement);
  });
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}