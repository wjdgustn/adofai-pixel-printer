const fs = require('fs');
const Jimp = require('jimp');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const input = [];

process.stdout.write('얼불춤 맵으로 변환할 사진의 파일명을 입력해주세요(확장자까지) : ');

const adofai_base = `{
\t"pathData": "", 
\t"settings":
\t{
\t\t"version": 2, 
\t\t"artist": "", 
\t\t"specialArtistType": "None", 
\t\t"artistPermission": "",
\t\t"song": "", 
\t\t"author": "HYONSU", 
\t\t"separateCountdownTime": "Enabled", 
\t\t"previewImage": "", 
\t\t"previewIcon": "", 
\t\t"previewIconColor": "003f52", 
\t\t"previewSongStart": 0, 
\t\t"previewSongDuration": 10, 
\t\t"seizureWarning": "Disabled", 
\t\t"levelDesc": "", 
\t\t"levelTags": "", 
\t\t"artistLinks": "", 
\t\t"difficulty": 1,
\t\t"songFilename": "", 
\t\t"bpm": 100, 
\t\t"volume": 100, 
\t\t"offset": 0, 
\t\t"pitch": 100, 
\t\t"hitsound": "Kick", 
\t\t"hitsoundVolume": 100, 
\t\t"countdownTicks": 4,
\t\t"trackColorType": "Single", 
\t\t"trackColor": "debb7b", 
\t\t"secondaryTrackColor": "ffffff", 
\t\t"trackColorAnimDuration": 2, 
\t\t"trackColorPulse": "None", 
\t\t"trackPulseLength": 10, 
\t\t"trackStyle": "Standard", 
\t\t"trackAnimation": "None", 
\t\t"beatsAhead": 3, 
\t\t"trackDisappearAnimation": "None", 
\t\t"beatsBehind": 4,
\t\t"backgroundColor": "000000", 
\t\t"bgImage": "", 
\t\t"bgImageColor": "ffffff", 
\t\t"parallax": [100, 100], 
\t\t"bgDisplayMode": "FitToScreen", 
\t\t"lockRot": "Disabled", 
\t\t"loopBG": "Disabled", 
\t\t"unscaledSize": 100,
\t\t"relativeTo": "Player", 
\t\t"position": [0, 0], 
\t\t"rotation": 0, 
\t\t"zoom": 500,
\t\t"bgVideo": "", 
\t\t"loopVideo": "Disabled", 
\t\t"vidOffset": 0, 
\t\t"floorIconOutlines": "Disabled", 
\t\t"stickToFloors": "Enabled", 
\t\t"planetEase": "Linear", 
\t\t"planetEaseParts": 1
\t},
\t"actions":
\t[
\t\t{ "floor": 0, "eventType": "MoveTrack", "startTile": [0, "Start"], "endTile": [0, "End"], "duration": 0, "positionOffset": [0, 0], "rotationOffset": 0, "scale": 200, "opacity": 100, "angleOffset": 0, "ease": "Linear", "eventTag": "" }
\t]
}`;

rl.on('line', line => {
    input.push(line);
    switch(input.length) {
        case 1:
            process.stdout.write('맵으로 변환할 얼불춤 맵의 가로 타일 수를 입력해주세요(많을수록 선명한 이미지) : ');
            break;
        case 2:
            process.stdout.write('맵으로 변환할 얼불춤 맵의 세로 타일 수를 입력해주세요(많을수록 선명한 이미지) : ');
            break;
        case 3:
            rl.close();
    }
}).on('close', async () => {
    if(input.length < 3) {
        console.log('\n\n변환을 취소합니다.');
        process.exit(0);
    }

    const image = await Jimp.read(input[0]);

    const width = input[1];
    const height = input[2];

    const map = JSON.parse(adofai_base);
    map.pathData = 'R'.repeat(width * height - 1);
    for(let count = 1; count < height; count++) {
        map.actions.push({ "floor": width * count, "eventType": "PositionTrack", "positionOffset": [width * -1, -1], "editorOnly": "Disabled" });
    }

    let lasthex;
    for(let tile = 0; tile < width * height; tile++) {
        const hex = image.getPixelColor(tile % width * (image.bitmap.width / width), Math.floor(tile / width) * (image.bitmap.height / height));
        const hexstring = hex.toString(16);
        if(hexstring == lasthex) continue;

        map.actions.push({ "floor": tile, "eventType": "ColorTrack", "trackColorType": "Single", "trackColor": hexstring, "secondaryTrackColor": "ffffff", "trackColorAnimDuration": 2, "trackColorPulse": "None", "trackPulseLength": 10, "trackStyle": "Standard" });
        lasthex = hexstring;
    }

    fs.writeFileSync('./export.adofai', JSON.stringify(map, null, 2));
});