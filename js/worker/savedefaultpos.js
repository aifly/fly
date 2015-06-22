this.onmessage = function (e) {
    var pixX = e.data.pixX, pixY = e.data.pixY, oneW = e.data.oneW, oneH = e.data.oneH, left = e.data.left, top = e.data.top;
    var defaultPos = [];
    for (var i = 0; i < pixX; i++) {
        for (var j = 0; j < pixY; j++) {
            var pos = {
                sx: i * oneW,
                sy: j * oneH,
                sw: oneW,
                sh: oneH,
                x: i * oneW + left,
                y: j * oneH + top,
                ew: oneW,
                eh: oneH
            };
            defaultPos.push(pos);
        }
    }
    postMessage(defaultPos);
}