var Keyboard = function() {
    var click       = function(){},
        activate    = function(){},
        deactivate  = function(){},
        board       = document.createElement("ul"),
        div         = document.createElement("div"),
        shiftKey    = false,
        ctrlKey     = false,
        capslockKey = false,
        altKey      = false,
        hidden      = false,
        matches,
        buttons,
        args = arguments
    ;

    if (!args[0]
        || typeof args[0] !== "object"
        || !args[0]["path_to_buttons"]) {
        throw new Error("path to buttons wasn't defined");
    }

    (function(doc) {
        var m =
            doc.matchesSelector ||
            doc.webkitMatchesSelector ||
            doc.mozMatchesSelector ||
            doc.oMatchesSelector ||
            doc.msMatchesSelector
        ;

        matches = function() {
            return m.call(arguments[0], arguments[1]);
        };
    })(document.documentElement);

    (function(callback) {
        var xmlhttp;

        if (window.XMLHttpRequest)
            xmlhttp = new XMLHttpRequest();
        else
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

        xmlhttp.open("GET", args[0]["path_to_buttons"], true);

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState !== 4 || xmlhttp.status !== 200)
                return;

            buttons = JSON.parse(xmlhttp.responseText)["buttons"];

            if (typeof callback === "function") {
                return callback();
            }
        }

        if (xmlhttp.overrideMimeType)
            xmlhttp.overrideMimeType("application/json");

        xmlhttp.send();
    }(fix_buttons));

    function fix_buttons() {
        var calculate_width = function(full_width, inx) {
                for (var i=inx, count_buttons=0; i < buttons.length; i += 1) {
                    if (buttons[i].priority) {
                        count_buttons += parseInt(buttons[i].priority, 10);
                    } else {
                        count_buttons += 1;
                    }

                    if (buttons[i].type.match(/lastitem/))
                        break;
                }
                return parseInt(full_width / count_buttons, 10);
            },
            width = calculate_width(document.body.clientWidth - 50, 0),
            button,
            li = board.querySelectorAll("li")[0] || document.createElement("li"),
            next_li
        ;
        buttons.forEach(function(b, inx) {
            button = li.querySelector('.' + b.type.replace(/\s/g, '.') + "[data-keyCode='" + b.keyCode + "']")
                || document.createElement("div");

            b.type.split(' ').forEach(function(c) {
                button.classList.add(c);
            });

            if (matches(button, ".symbol")) {
                button.setAttribute("data-on", b.on);
                button.setAttribute("data-off", b.off);
                button.innerHTML = b.off;
            } else {
                button.innerHTML = b.value;
            }

            button.setAttribute("data-keyCode", b.keyCode);

            button.setAttribute("style",
                                "display:inline-block;"
                                + "margin-right:2px;"
                                + "line-height:40px;"
                                + "background:#fff;"
                                + "height:100%;"
                                + "border-radius:3px;"
                                + "cursor:pointer;"
                               );

            button.style.width=(b.priority ? width * b.priority : width) + "px";

            li.appendChild(button);

            if (matches(button, ".lastitem")) {
                li.style.width = "100%";
                li.style.height = "40px";
                li.style.marginBottom = "1px";
                li.style.cssFloat = "left";
                li.style.textAlign = "center";
                li.style.opacity = 0.8;
                next_li = li.nextSibling || document.createElement("li");
                board.appendChild(li);
                li = next_li;
                width = calculate_width(document.body.clientWidth - 50, inx + 1);
            }
        });

        board.id = "keyboard";
        board.style.fontSize = "14px";
        board.style.listStyle = "none";
        board.style.margin = "0px";
        board.style.padding = "0px";

        div.classList.add("keyboard-container");
        div.appendChild(board);
        div.style.display = "inline-block";
        div.style.position = "fixed";
        div.style.bottom = 0;
        div.style.left = 0;
    }

    function delay(target, buttons)
    {
        if (buttons instanceof HTMLElement)
            buttons = [buttons];

        var i = buttons.length - 1;
        if (target) {
            for(; i >= 0; i -= 1)
                deactivate(buttons[i]);
        } else {
            for(; i >= 0; i -= 1)
                activate(buttons[i]);
        }
    }

    function click_event(e) {
        var self = e.target,
            obj = {};

        var shift_click = function(on) {
            var letters = board.querySelectorAll(".letter"),
                i,
                symbols = board.querySelectorAll(".symbol")
            ;

            for (i = letters.length - 1; i >= 0; i -= 1) {
                if (!shiftKey)
                    letters[i].innerHTML = letters[i].innerHTML.toUpperCase();
                else if (!on)
                    letters[i].innerHTML = letters[i].innerHTML.toLowerCase();
            }
            for (i = symbols.length - 1; i >= 0; i -= 1) {
                if (!shiftKey)
                    symbols[i].innerHTML = symbols[i].getAttribute("data-on");
                else if (!on)
                    symbols[i].innerHTML = symbols[i].getAttribute("data-off");
            }

            delay(shiftKey, board.querySelectorAll(".right-shift,.left-shift"));
            shiftKey = !shiftKey;
            delay(true, board.querySelectorAll(".capslock"));
            capslockKey = false;
        }

        if (matches(self, ".right-shift, .left-shift")) {
            shift_click(!shiftKey);
            return false;
        } else if (matches(self, ".capslock")) {
            (function() {
                for (var letters=board.querySelectorAll(".letter"), i=letters.length - 1; i >= 0; i -= 1) {
                    if (!capslockKey)
                        letters[i].innerHTML = letters[i].innerHTML.toUpperCase();
                    else
                        letters[i].innerHTML = letters[i].innerHTML.toLowerCase();
                }
                delay(capslockKey, self);
                capslockKey = !capslockKey;
            }());
            return false;
        } else if (matches(self, ".right-ctrl, .left-ctrl")) {
            delay(ctrlKey, board.querySelectorAll(".right-ctrl,.left-ctrl"));
            ctrlKey = !ctrlKey;
            return false;
        } else if (matches(self, ".left-alt, .right-alt")) {
            delay(altKey, board.querySelectorAll(".left-alt, .right-alt"));
            altKey = !altKey;
            return false;
        } else if (matches(self, ".hide-keyboard")) {
            (function() {
                var buttons = board.querySelectorAll("div"),
                    i = buttons.length-1;
                if (hidden) {
                    for (; i >= 0; i -= 1)
                        buttons[i].style.display = "inline-block";
                    self.innerHTML = '⇊';
                } else {
                    for (; i >= 0; i -= 1)
                        buttons[i].style.display = "none";
                    self.innerHTML = '⇈';
                }
                hidden = !hidden;
                self.style.display = "inline-block";
            })();
            return false;
        }

        obj.ctrlKey = ctrlKey;
        obj.altKey = altKey;
        obj.shiftKey = shiftKey;
        obj.keyCode = parseInt(self.getAttribute("data-keycode"), 10);

        // Delete
        if (matches(self, ".delete") ||
            matches(self, ".tab") ||
            matches(self, ".arrow") ||
            matches(self, ".return") ||
            matches(self, ".f")
           ) {
            obj.charCode = 0;
        } else if (matches(self, '.space')) {
            obj.charCode = ' '.charCodeAt();
        } else {
            obj.charCode = self.innerHTML.charCodeAt();
        }

        if (args[0]["handler_for_" + obj.keyCode]
            && typeof args[0]["handler_for_" + obj.keyCode] === "function") {
            args[0]["handler_for_" + obj.keyCode](obj);
        }

        click(obj);

        if (shiftKey)
            shift_click(false);

        if (navigator.vibrate)
            navigator.vibrate(30);

        e.preventDefault();
        return true;
    }

    function start(e)
    {
        if (e.touches && e.touches.length < 2)
            e.preventDefault();

        if (!matches(e.target, "div[data-keycode]"))
            return;

        if (click_event(e)) {
            start.targets.push(e.target);
            activate(e.target);
            start.timeouts.push(setTimeout(function() {
                start.intervals.push(setInterval(function() {
                    click_event(e);
                }, 30));
            }, 500));
        }
    }

    start.intervals = [];
    start.targets = [];
    start.timeouts = [];

    function end(e)
    {
        while (start.targets.length) {
            deactivate(start.targets.shift());
        }
        while (start.intervals.length) {
            clearInterval(start.intervals.shift());
        }
        while (start.timeouts.length) {
            clearTimeout(start.timeouts.shift());
        }
    }

    board.addEventListener("touchstart", start);
    board.addEventListener("mousedown", start);
    document.addEventListener("mouseup", end);
    document.addEventListener("touchend", end);

    try {
        screen.addEventListener("mozorientationchange", function (e) {
            setTimeout(fix_buttons, 500);
        });
    } catch (e) {
        window.addEventListener("orientationchange", function(e) {
            setTimeout(fix_buttons, 500);
        });
    }

    return {
        html : function() {
            return div;
        },
        click : function(func) {
            click = func;
            return this;
        },
        activate_button : function(func) {
            activate = func;
            return this;
        },
        deactivate_button : function(func) {
            deactivate = func;
            return this;
        },
    };
};
