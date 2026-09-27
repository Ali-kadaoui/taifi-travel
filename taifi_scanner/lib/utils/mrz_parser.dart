class MrzParser {
  static Map<String, String> parseMoroccanCin(String ocrText) {
    Map<String, String> data = {
      "first_name": "",
      "last_name": "",
      "cin_number": "",
      "date_of_birth": "",
      "sex": ""
    };

    List<String> lines = ocrText.toUpperCase().split('\n');
    List<String> mrzLines = [];

    // Filter lines that look like MRZ
    for (String line in lines) {
      if (line.trim().length > 10) {
        mrzLines.add(line.replaceAll(RegExp(r'[^A-Z0-9<]'), ''));
      }
    }

    for (String line in mrzLines) {
      // Parse Names
      if (line.contains('<<') && !RegExp(r'\d').hasMatch(line)) {
        String cleanLine = line.replaceAll(RegExp(r'^<+|<+$'), '');
        List<String> nameParts = cleanLine.split('<<');
        
        if (nameParts.isNotEmpty) {
          data["last_name"] = nameParts[0].replaceAll('<', ' ').trim();
        }
        if (nameParts.length >= 2) {
          data["first_name"] = nameParts[1].replaceAll('<', ' ').trim();
        }
      }

      // Parse DOB and Sex
      RegExp dateSexRegExp = RegExp(r'^([0-9OILZBSG]{6})[0-9OILZBSG]([MFE<])');
      Match? match = dateSexRegExp.firstMatch(line);
      if (match != null) {
        String dobRaw = match.group(1)!;
        
        // Handle common OCR typos for numbers
        const mistakes = {'O':'0', 'I':'1', 'L':'1', 'Z':'2', 'B':'8', 'S':'5', 'G':'6'};
        dobRaw = dobRaw.split('').map((char) => mistakes[char] ?? char).join('');

        if (RegExp(r'^\d+$').hasMatch(dobRaw)) {
          String yy = dobRaw.substring(0, 2);
          String mm = dobRaw.substring(2, 4);
          String dd = dobRaw.substring(4, 6);
          
          int yearInt = int.parse(yy);
          String year = yearInt > 26 ? "19$yy" : "20$yy";
          data["date_of_birth"] = "$year-$mm-$dd";
        }

        String sexChar = match.group(2)!;
        if (sexChar == 'M') { data["sex"] = "Male"; }
        else if (sexChar == 'F' || sexChar == 'E') { data["sex"] = "Female"; }
      }

      // Parse CIN
      RegExp cinRegExp = RegExp(r'([A-Z]{1,2}[0-9]{4,8})<+');
      Match? cinMatch = cinRegExp.firstMatch(line);
      if (cinMatch != null) {
        String possibleCin = cinMatch.group(1)!;
        if (RegExp(r'^[A-Z]').hasMatch(possibleCin)) {
          data["cin_number"] = possibleCin;
        }
      }
    }
    return data;
  }
}
