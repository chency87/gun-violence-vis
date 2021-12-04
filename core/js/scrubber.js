function Scrubber(values, {
    format = value => value,
    initial = 0,
    delay = null,
    autoplay = true,
    loop = true,
    loopDelay = null,
    alternate = false
} = {}) {
    values = Array.from(values);
    // console.log(values)
    let frame = null;
    let timer = null;
    let interval = null;
    let direction = 1;
    document.getElementById('progress-input').max = values.length - 1
    document.getElementById('progress-input').value = initial

    var btn = document.getElementById('progress-status-btn'),
        input = document.getElementById('progress-input'),
        output = document.getElementById('progress-output');

    function start() {
        document.getElementById('progress-status-btn').textContent = "Pause"
        if (delay === null) frame = requestAnimationFrame(tick);
        else interval = setInterval(tick, delay);
    }
    function stop() {
        document.getElementById('progress-status-btn').textContent = "Play"


        if (frame !== null) cancelAnimationFrame(frame), frame = null;
        if (timer !== null) clearTimeout(timer), timer = null;
        if (interval !== null) clearInterval(interval), interval = null;
    }
    function running() {
        return frame !== null || timer !== null || interval !== null;
    }
    function tick() {
        current_val = document.getElementById('progress-input').valueAsNumber
        if (current_val === (direction > 0 ? values.length - 1 : direction < 0 ? 0 : NaN)) {
            if (!loop) return stop();
            if (alternate) direction = -direction;
            if (loopDelay !== null) {
                if (frame !== null) cancelAnimationFrame(frame), frame = null;
                if (interval !== null) clearInterval(interval), interval = null;
                timer = setTimeout(() => (step(), start()), loopDelay);
                return;
            }
        }
        if (delay === null) frame = requestAnimationFrame(tick);
        step();
    }
    function step() {
        document.getElementById('progress-input').valueAsNumber = (document.getElementById('progress-input').valueAsNumber + direction + values.length) % values.length;
        document.getElementById('progress-input').dispatchEvent(new CustomEvent("input", { detail:{date:document.getElementById('progress-output').value }, bubbles: true }));
        // console.log(document.getElementById('progress-output').value)
    }

    // , document.getElementById('progress-input').valueAsNumber, values
   
    document.getElementById('progress-input').oninput = event => {
        if (event && event.isTrusted && running()) stop();
        // console.log(values)
        // console.log()
        // console.log(values[document.getElementById('progress-input').value])
        // document.getElementById('progress-form').value = values[document.getElementById('progress-input').value];
        let out_val = values[document.getElementById('progress-input').value]
        // console.log(out_val)
        document.getElementById('progress-output').value = format(out_val);
    };
    btn.onclick = () => {
      if (running()) return stop();
      direction = alternate && input.valueAsNumber === values.length - 1 ? -1 : 1;
      input.valueAsNumber = (input.valueAsNumber + direction) % values.length;
      input.dispatchEvent(new CustomEvent("input", {bubbles: true}));
      start();
    };
    input.oninput();
    if(autoplay){
        start()
    }else{
        stop();
    }
    // Inputs.disposal(form).then(stop);
    return 'form';
}

