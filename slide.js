/*
 * Slide插件
 * @params elm: 需要滚动元素
 * @params options: 配置参数(详细见下面说明)
 * @author: Jeffery
 * jefferyho1993@outlook.com
 */
;
(function ($, window, document, undefined) {
    function Slide(elm, options) {
        var me = this;
        var $elm = me.checkElm(elm) ? $(elm) : $;

        var opts = {
            duration: 2000, // 运动时长
            auto: false, // 自动开始
            mode: 'vertical', // 滚动方式： vertical | horizontal
            arrow: true, // 增加控制
            keepArrow: false,   //默认显示arrow： 隐藏
            direction: true, // 轮播方向: true-[从下往上，从右往左], false-相反
            resize: false,  // 开启相对布局
        };

        opts = $.extend(opts, options || {});

        //$elm
        me.elm = $elm;
        //opts
        me.opts = opts;
        //是否自动滚动
        me.auto = opts.auto;
        // 当前滚动索引
        me.index = 0;
        // 元素总个数
        me.length = $elm.children().length + 1;
        //自动滚动时长
        me.duration = opts.duration;
        // 滚动的方式
        me.mode = opts.mode === 'vertical' ? 'top' : 'left';
        // 滚动方向
        me.direction = opts.direction;
        // 滚动的距离
        me.distance = opts.mode === 'vertical' ? $elm.parent().height() : $elm.parent().width();
        // 自动播放的定时器
        me.timer = null;
        // 控制组件
        me.arrow = null;
        // 控制组件默认显示
        me.keepArrow = opts.arrow && opts.keepArrow;
        // resize
        me.resize = opts.resize;
    }

    Slide.prototype.init = function () {
        var me = this, timeout;

        // 首尾衔接
        me.elm.append(me.elm.children().first().clone());

        if (me.opts.arrow) {
            me.addArrow();
        }

        me.setStyle();

        me.play();

        // 控制组件响应
        if (!me.arrow) return;
        me.elm.parent().on("mouseenter", function () {
            !me.keepArrow && me.arrow.fadeIn(100);
            me.stop();
        }).on("mouseleave", function () {
            !me.keepArrow && me.arrow.fadeOut(100);
            me.play();
        });

        // 响应resize

        if (!me.resize) return;
        $(window).on('resize', function () {
            window.clearInterval(me.timer);
            // 节流
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                me.setStyle();
                me.distance = (me.mode === 'top' ? me.elm.parent().height() : me.elm.parent().width());
                var step = {};
                step[me.direction] = -me.distance * me.index + 'px';
                me.elm.css(step);

                me.play();
            }, 300);
        });
    };

    // 添加arrow
    Slide.prototype.addArrow = function () {
        var me = this;
        var timer = null;

        me.elm.parent().append("<span class='slide_control'>&lt;</span><span class='slide_control'>&gt;</span>");

        me.arrow = me.elm.parent().children('span.slide_control');

        me.arrow.first().on('click', function () {
            clearTimeout(timer);

            timer = setTimeout(function () {
                me.prev();
            }, 200);
        });

        me.arrow.last().on('click', function () {
            clearTimeout(timer);

            timer = setTimeout(function () {
                me.next();
            }, 200);
        });
    };

    // 设置元素样式
    Slide.prototype.setStyle = function () {
        var me = this;
        var w = me.elm.parent().width(),
            h = me.elm.parent().height();

        //parent style
        me.elm.parent().css({
            'position': 'relative',
            'overflow': 'hidden',
        });

        // list-wrapper style
        me.elm.css({
            width: me.opts.mode === 'vertical' ? 'auto' : '999999px',
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            height: h + 'px',
            lineHeight: h + 'px',
        });

        // list-item style
        me.opts.mode !== 'vertical' && me.elm.children().css({
            float: 'left',
            width: w + 'px',
            height: h + 'px',
            lineHeight: h + 'px'
        });

        if (!me.arrow) return;
        // arrow style
        me.elm.parent().children('span.slide_control').css({
            fontSize: '1.2rem',
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            left: '6px',
            userSelect: 'none',
            cursor: 'pointer',
            display: !me.keepArrow ? 'none' : 'auto'
        });
        me.elm.parent().children('span.slide_control').last().css({
            left: 'auto',
            right: '6px'
        });
    };

    /* 
     * 播放
     * @params isBackward: 是否逆序，默认是正序
     */
    Slide.prototype.move = function (isBackward) {
        var me = this;
        var backward = isBackward; // 是否正向播放
        var step = {};

        step[me.mode] = -me.distance * me.index + 'px';
        me.elm.stop(true, true) // document.visibilityChange适配
            .animate(step, function () {
                if (!backward && me.index === me.length - 1) { // 正向最后一张
                    me.index = 0;
                    step[me.mode] = -me.distance * me.index + 'px';
                    me.elm.css(step);
                } else if (backward && me.index === 0) { // 逆向第一张
                    me.index = me.length - 1;
                    step[me.mode] = -me.distance * me.index + 'px';
                    me.elm.css(step);
                }
            });
    };

    // 下一个
    Slide.prototype.next = function () {
        var me = this;
        var step = {};
        if (me.index === me.length - 1) {
            me.index = 0;
            step[me.mode] = -me.distance * me.index + 'px';
            me.elm.css(step);
        }
        me.index++;

        me.move();
    };

    // 上一个
    Slide.prototype.prev = function () {
        var me = this;
        var step = {};

        // 首次修复
        if (me.index === 0) {
            me.index = me.length - 1;
            step[me.mode] = -me.distance * me.index + 'px';
            me.elm.css(step);
        }

        me.index--;
        me.move(true);
    };

    // stop
    Slide.prototype.stop = function () {
        window.clearInterval(this.timer);
    };

    //play 
    Slide.prototype.play = function () {
        var me = this;

        if (me.auto) {
            me.timer = setInterval(function () {
                if (me.direction) {
                    me.next();
                } else {
                    me.prev();
                }
            }, me.duration);
        }

    };

    // 检查元素
    Slide.prototype.checkElm = function (elm) {
        if ($(elm).length > 0) {
            return true;
        } else {
            throw "this element does not exist.";
        }
    };

    window['Slide'] = Slide;

})(jQuery, window, document);
