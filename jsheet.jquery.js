;
(function($, window, document, undefined) {
    "use strict";
    /** * --------------------------------------------------------------------
     * @param undefined * 글로벌 전역 변수인 undefined 사용합니다.
     * 단, ES3 에서는 다른 누군가에 의해서 전역 변수인 undefined 를
     * 변경할 수 있기 때문에 실제 undefined 인지 확신할 수 없습니다.
     * ES5 에서 undefined 는 더이상 값을 변경할 수 없습니다.
     * 같은 구조 샘플 : https://github.com/takemaru-hirai/japan-map/blob/master/jquery.japan-map.js
     * ----

     /** * -------------------------------------------------------------------
      * @param window, document * window, document 는 전역 스코프가 아니라 지역스코프에서 사용하도록 설정
      * 이는 프로세스를 조금 더 빠르게 해결하고 능률적으로 minified 할 수 있다.
      * (특히, 해당 플러그인이 자주 참조될 경우에)
      * ----------------------------------------------------------------------
      */

    // defaults 는 한번만 생성합니다.
    var pluginName = 'jsheet',
        defaults = {
            version: "1.10", // plugin version
            dataMethod: "ajax", // How to import data
            dataType: "json", // Content-Type
            parseURL: "/dev/data.json", // How to import data
            autoCommit: true, // Post-Work DOM Rendering Use or not
            headerGroup: true, // table top header Use or not
            fixedHeader: true, // table fixed header Use or not
            fixedColumn: true, // table fixed column Use or not
            fixedCount: 3, // table fixed column count
            controllerBar: true, // Cell control bar Use or not
            controllerBarItem: [ // glyphicon
                "save",
                "pencil",
                "align-left",
                "align-center",
                "align-right",
                "tasks",
            ],
            filter: true, // table Filter Use or not
            data: null,
            history: [],
        };

    // plugin constructor
    function Plugin(element, options) {
        /** * ----------------------------------------------------------------
         * 제이쿼리는 두개 또는 그 이상의 객체들을 첫번째 객체에
         * 저장하여 병합,확장할 수 있는 $.extend 유틸리티를 소유하고 있습니다.
         * 일반적으로 첫번째 객체에 {}, 빈 객체를 설정하여 * 플러그인 인스턴스에 대한 default option(기본옵션)을
         * 변경시키지 않도록 하기 위함입니다.
         * ---------------------------------------------------------------- */
        this.element = element;
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype.init = function() {
        /** * ----------------------------------------------------------------
         * 이곳에 초기화 로직을 작성합니다.
         * 여러분은 이미 인스턴스를 통해 DOM 요소, options 을 사용할 수 있습니다.
         * (예. this.element, this.options)
         * ------------------------------------------------------------------ */
        this.loadData();
    };

    Plugin.prototype.loadData = function() {
        // make loader options
        var loader_options = { //global
            target:        this.element,
            type:          "outer",
            spin_second:   "0.5s",
            loader_margin: "-150px 0px 0px 0px"
        };

        if (this.options.dataMethod) {
            // get data
            this.func(this.options.dataMethod, {
                url: this.options.parseURL,
                func: "deaultLender2Element",
                data: this.options.data,
                loader_options: loader_options,
            });
        }
    };

    // 기본 테이블 생성
    Plugin.prototype.deaultLender2Element = function(data) {
        // set data to module
        this.options.data = data;

        if (this.options.controllerBar) {
            var controllerBar = this.createControllerBar();
            this.element.appendChild(controllerBar);
        }

        var contents = document.createElement("DIV");
        contents.className = "jsheet-table";

        var header = this.createHeader();
        var body   = this.createBody();

        contents.appendChild(header);
        contents.appendChild(body);

        this.element.appendChild(contents);

        this.func("setSyncScroll");

        this.func("setStaticEventListener");

        // return this.domLender({
        //     terget: this,
        //     html: lenderElement
        // });
    };

    // Create Table Header Element / 테이블 헤더 생성
    Plugin.prototype.createHeader = function() {
        var table_warp_div = document.createElement("DIV");
        var table          = document.createElement("TABLE");
        var thead          = document.createElement("THEAD");
        var col_data       = this.options.data.col_data;

        table_warp_div.className = "jsheet-table-header-warp";
        table.className = "jsheet-table-header";

        table_warp_div.appendChild(table);

        // 그룹 헤더가 존재 할 경우.
        if (this.options.headerGroup) {
            var group_col_th   = document.createElement("TR"),
                col_th         = document.createElement("TR"),
                tmp_group_name = "",
                col_span       = 1;

            // 헤더 데이터 드로잉 반복문
            for (var idx in col_data) {
                var info     = JSON.parse(col_data[idx]["CHANGE_COLUMN_INFO"]);
                var th_group = document.createElement("TH");
                var th_col   = document.createElement("TH");

                th_col.innerHTML          = col_data[idx]["COMMENT"];
                th_col.dataset.column_seq = col_data[idx]["COLUMN_SEQ"];
                th_col.style.minWidth     = info["WIDTH"] + "px";

                // 그룹인지 아닌지 해당 조건으로 체크
                if (col_data[idx]["GROUP_NO"] == 0) {
                    // 그룹이 아닐 경우
                    th_group.colSpan   = 1;
                    th_group.innerHTML = col_data[idx]["GROUP_NAME"];
                    group_col_th.appendChild(th_group);
                } else {
                    // 그룹일 경우
                    if (tmp_group_name == "") {
                        // 그룹 네임이 없을 경우 첫 그룹으로 간주
                        col_span       = 1;
                        tmp_group_name = col_data[idx]["GROUP_NAME"];

                    } else if (idx == (col_data.length - 1)) {
                        // 가장 마지막 열 일 경우
                        th_group.colSpan   = (col_span + 1);
                        th_group.innerHTML = tmp_group_name;
                        group_col_th.appendChild(th_group);

                    } else if (tmp_group_name != col_data[idx]["GROUP_NAME"]) {
                        // 그룹명이 달라질 경우 새로운 그룹으로 매핑
                        th_group.colSpan = col_span;
                        th_group.innerHTML = tmp_group_name;
                        group_col_th.appendChild(th_group);

                        col_span = 1;
                        tmp_group_name = col_data[idx]["GROUP_NAME"];

                    } else {
                        // 이전 그룹과 같은 그룹일 경우
                        col_span += 1;
                    }
                }
                // 고정 열의 수의 따라 클래스 부여
                if (this.options.fixedHeader && idx < this.options.fixedCount) {
                    th_group.className = "col-fixed";
                    th_col.className   = "col-fixed";
                    col_th.appendChild(th_col);
                }

                col_th.appendChild(th_col);
            }
            thead.appendChild(group_col_th);
            thead.appendChild(col_th);

            table.appendChild(thead);
        }
        // 그룹 헤더가 없을 경우 else
        table_warp_div.appendChild(table);

        // 고정 헤더(fixed header) 일때
        if (this.options.fixedHeader)
        {
            var c_table  = document.createElement("TABLE"),
                thead    = document.createElement("THEAD"),
                tr_group = document.createElement("TR"),
                tr_col   = document.createElement("TR"),
                fixed_th = $(table).find("th.col-fixed").clone(),
                for_idx  = (fixed_th.length/2);

            c_table.className = "jsheet-table-header-fixed";

            for (var i = 0; i < for_idx; i++) {
                tr_group.appendChild(fixed_th[i]);
                tr_col.appendChild(fixed_th[i+for_idx]);
            }

            thead.appendChild(tr_group);
            thead.appendChild(tr_col);
            c_table.appendChild(thead);
            table_warp_div.appendChild(c_table);
        }

        return table_warp_div;
    };

    // Create Table Body Element / 테이블 바디 생성
    Plugin.prototype.createBody = function() {
        var table_warp_div = document.createElement("DIV");
        var table_warp_body_div = document.createElement("DIV");
        var table          = document.createElement("TABLE");

        table_warp_div.className = "jsheet-table-body-warp";
        table.className = "jsheet-table-body";

        var tbody = document.createElement("TBODY");
        var r     = this.options.data.row_data;

        // 행 드로잉 반복문
        for (var i in r) {
            var tr   = document.createElement("TR");
            var c_d  = r[i]["ROW_LIST"];
            // 열 드로잉 반복문
            for (var c_i in c_d) {
                var td   = document.createElement("TD");
                var info = JSON.parse(c_d[c_i]["CHANGE_COLUMN_INFO"])

                td.dataset.cglist_seq = c_d[c_i]["CGLIST_SEQ"];
                td.dataset.column_seq = c_d[c_i]["COLUMN_SEQ"];
                td.dataset.type       = info["TYPE"];
                td.style.minWidth     = info["WIDTH"]+"px";
                td.style.maxWidth     = info["WIDTH"]+"px";
                td.innerHTML          = c_d[c_i]["DATA"];

                if (info["FIXED"] == "Y") $(td).addClass('fixed-cell');

                if (info["TYPE"] != "text" && info["TYPE"] != "textarea") $(td).addClass('disable');
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
            table.appendChild(tbody);
        }

        // fixed 일때
        if (this.options.fixedColumn)
        {
            var c_table  = document.createElement("TABLE"),
                tbody    = document.createElement("TBODY"),
                tr_col   = document.createElement("TR"),
                o_table  = $(table).find("td.fixed-cell"),
                fixed_th = o_table.clone(),
                for_idx  = (fixed_th.length);

            c_table.className = "jsheet-table-body-fixed";

            for (var i = 0; i < for_idx; i++) {
                // console.log($(fixed_th[i]).height());
                tr_col.appendChild(fixed_th[i]);
                if (((i+1) % 3) === 0 )
                {
                    tbody.appendChild(tr_col);
                    tr_col = document.createElement("TR")
                }
            }
            c_table.appendChild(tbody);
            table_warp_div.appendChild(c_table);
        }
        table_warp_div.appendChild(table);

        return table_warp_div;
    };

    // Create ControllerBar Element / 제어창 생성
    Plugin.prototype.createControllerBar = function() {
        var controll_bar       = document.createElement("DIV");
        controll_bar.className = "controll-bar";

        var list       = document.createElement("UL");
        list.className = "controll-bar-list";

        for (var item_index in this.options.controllerBarItem) {
            var item = this.options.controllerBarItem[item_index];
            var li   = document.createElement("LI");
            var span = document.createElement("SPAN");

            li.className   = "controll-bar-list-item";
            span.className = "glyphicon glyphicon-" + item;

            li.appendChild(span);
            list.appendChild(li);
        }
        controll_bar.appendChild(list);

        return controll_bar;
    };

    // initial event binding / 초기 테이블 생성 후 이벤트 리스너
    Plugin.prototype.setStaticEventListener = function() {
        var self            = this,
            _target         = $(this.element),
            arr_header_cell = $(this.element).find("TH"),
            arr_body_cell   = $(this.element).find("TD");

        // Header & Body Sequencing
        self.cellSequencing(this.element);

        // Cell Event Bind
        self.clearEvent(arr_body_cell, "click");
        $(arr_body_cell).on({
            click       : function ()
            {
                self.setSelectCell(this.id);
            },
            contextmenu : function (evt)
            {
                evt.preventDefault();
                self.contextMenuEvent(this.id);
            }
        });

        // Key Binding (window)
        self.setKeyEvent();
    };

    Plugin.prototype.clearEvent = function(element, evt) {
        return $(element).off(evt);
    };

    Plugin.prototype.cellSequencing = function(element) {
        var fixed_td         = $(".jsheet-table-body-fixed").find("TD"),
            origin_td        = $(".jsheet-table-body").find("TD").not(".fixed-cell"),
            col_length       = ($(".jsheet-table-body").find("TR:first > TD").length - this.options.fixedCount),
            fixed_row_count  = 0,
            fixed_col_count  = 0,
            origin_row_count = 0,
            origin_col_count = this.options.fixedCount;

        // set length to this plugin golbal variable
        this.options.col_length = col_length;
        this.options.row_length = $(".jsheet-table-body").find("TR").length;

        for (var i = 0; i < fixed_td.length; i++)
        {
            $(fixed_td[i]).addClass('r'+fixed_row_count);
            $(fixed_td[i]).addClass('c'+fixed_col_count);
            $(fixed_td[i]).prop("id", "r"+fixed_row_count+"_c"+fixed_col_count);

            fixed_col_count++;
            if ((i%this.options.fixedCount) == (this.options.fixedCount - 1))
            {
                fixed_col_count = 0;
                fixed_row_count++;
            }
        }

        for (var i = 0; i < origin_td.length; i++)
        {
            $(origin_td[i]).addClass('r'+origin_row_count);
            $(origin_td[i]).addClass('c'+origin_col_count);
            $(origin_td[i]).prop("id", "r"+origin_row_count+"_c"+origin_col_count);

            origin_col_count++;
            if ((i%col_length) == (col_length-1))
            {
                origin_col_count = this.options.fixedCount;
                origin_row_count++;
            }
        }
    };

    Plugin.prototype.setKeyEvent = function() {
        var self = this;

        $(window).keydown(function (key) {
            if ($(".selected").length > 0)
            {
                // console.log(key.keyCode);

                switch (key.keyCode) {
                    case 37:    // arrow left
                            key.preventDefault();
                            var _id = $(".selected").attr("id").split("_");
                            var col_idx = _id[1].replace("c", "");
                            if (col_idx != 0)
                            {
                                self.setSelectCell(_id[0]+"_c"+(parseInt(col_idx)-1));
                            }
                        break;

                    case 39:    // arrow right
                            key.preventDefault();
                            var _id = $(".selected").attr("id").split("_");
                            var col_idx = parseInt(_id[1].replace("c", ""));

                            if (col_idx < ((self.options.col_length+self.options.fixedCount)-1))
                            {
                                self.setSelectCell(_id[0]+"_c"+(col_idx+1));
                            }
                        break;

                    case 38:    // arrow top
                            key.preventDefault();
                            var _id       = $(".selected").attr("id").split("_");
                            var row_idx   = parseInt(_id[0].replace("r", ""));
                            var next_cell = $(".selected")
                                .closest("TR")
                                .prevAll()
                                .not(".hide")
                                .first()
                                .find("#r"+(row_idx-1)+"_"+_id[1])
                                .attr("id");

                            if (row_idx != 0)
                            {
                                self.setSelectCell(next_cell);
                            }
                        break;

                        case 40:    // arrow bottom
                                key.preventDefault();
                                var _id       = $(".selected").attr("id").split("_");
                                var row_idx   = parseInt(_id[0].replace("r", ""));
                                var next_cell = $(".selected")
                                    .closest("TR")
                                    .nextAll()
                                    .not(".hide")
                                    .first()
                                    .find("#r"+(row_idx+1)+"_"+_id[1])
                                    .attr("id");

                                if (row_idx < (self.options.row_length-1))
                                {
                                    self.setSelectCell(next_cell);
                                }
                            break;
                        case 113:    // F2
                            self.edit($(".selected").attr("id"));
                            break;

                        case 83:    // ctrl + s
                            if (key.ctrlKey)
                            {
                                self.save($(".selected").attr("id"));
                            }
                            break;
                        case 90:    // ctrl + z
                            if (key.ctrlKey)
                            {
                                self.undo();
                            }
                            break;

                        case 27:    // ESC
                            self.cancel();
                            break;
                }
            }
        });
    };

    Plugin.prototype.historyPush = function(data) {
        return this.options.history.push(data);
    };

    Plugin.prototype.historyPop = function() {
        if (this.options.history.length > 0)
        {
            var rollback = this.options.history.pop();;
            $("#"+rollback.cell).html(JSON.parse(rollback.data));
        }
    };

    Plugin.prototype.cancel = function() {
        if ($(".edition").length > 0)
        {
            var ori_val =  JSON.parse($(".jsheet-text").attr("data-ori-text"));

            $(".edition")
               .html(ori_val.replace(/\n/g, "<br>"))
               .removeClass('edition');
        }
    };

    Plugin.prototype.undo = function() {
        //history pop
        this.func("historyPop");
    };

    Plugin.prototype.trVerticalSizeSync = function(cell) {
        var height = cell.outerHeight();
        var _class = cell[0].classList;
        $(".jsheet-table-body").find("."+_class[0]).first().closest("TR").height(height);
        $(".jsheet-table-body-fixed").find("."+_class[0]).first().closest("TR").height(height);
        // console.log(cell.className);
    };


    Plugin.prototype.save = function(cell_id) {
        if ($(".edition").length == 0) return false;

        // 저장 시 현재 셀의 Tr height를 타 테이블에 적용
        var s_cell = $("TD#"+cell_id);

        if (s_cell.hasClass('disable'))
        {
            console.log("custom");
        }
        else
        {
            var text_val  = $(".jsheet-text").val().replace(/\n/g, "<br>");
            var undo_data = $(".jsheet-text").attr("data-ori-text").replace(/\n/g, "<br>");

            $(s_cell).html(text_val).removeClass('edition');
        }

        //history push
        if (undo_data)
        {
            this.func("historyPush", {
                cell : cell_id,
                data : undo_data,
            });
        };
        return this.func("trVerticalSizeSync", s_cell);
    };

    Plugin.prototype.edit = function(cell_id) {
        //init
        this.func("cancel");

        if ($("TD#"+cell_id).hasClass('edition')) { return ; }

        //start edit
        var s_cell = $("TD#"+cell_id);

        if (s_cell.hasClass('disable'))
        {   // custom
            console.log("custom");
        }
        else
        {   // text
            var origin_val = s_cell
                .html()
                .replace(/\<br\>/g, "\n")
                .replace(/\<br \/\>/g, "\n");

            s_cell.addClass('edition')
            .html
            (
                $("<TEXTAREA></TEXTAREA>")
                    .addClass('jsheet-text')
                    .val(origin_val)
                    .attr("data-ori-text", JSON.stringify(origin_val))
            ).find("textarea").focus();
        }
    };

    Plugin.prototype.contextMenuEvent = function(cell_id) {
        console.log("contextMenuEvent");

        var s_cell = $("TD#"+cell_id);
        console.log(s_cell);
    };

    Plugin.prototype.setSelectCell = function(cell_id) {
        var s_cell     = $("TD#"+cell_id);
        // var f_selected = s_cell.hasClass('selected');

        // select class init
        $(this.element).find("TD").removeClass('selected');

        if ($(".edition").length > 0)
        {
            this.func("cancel", cell_id);
            // this.func("save", cell_id);
        }

        if (s_cell.length > 0)
        {
            var table     = $(".jsheet-table-body");
            var c_table_w = $(".jsheet-table-body-fixed").width();

            //select this cell
            s_cell.addClass('selected');

            // Adjust the scroll position according to cell focus / 셀 위치에 따라 스크롤바 조정
            var cell_offset = s_cell.offset();
            var scroll_top  = parseInt(table.height()-cell_offset.top);
            var scroll_left = parseInt(table.width()-cell_offset.left);

            // arrow bottom
            if (scroll_top < 0)
            {
                var scroll = table.scrollTop();
                scroll     = (scroll + (scroll_top*(-1))+30);
                table.scrollTop(scroll);
            }
            // arrow right
            if (scroll_left < s_cell.outerWidth())
            {
                var scroll = table.scrollLeft();
                scroll     = (scroll + (scroll_left*(-1))+20)+s_cell.outerWidth();
                table.scrollLeft(scroll);
            }
            // arrow top
            if ((table.height()-96)-scroll_top < 0)
            {
                var scroll = table.scrollTop();
                scroll     = scroll + ((table.height()-96)-scroll_top)-1;
                table.scrollTop(scroll);
            }
            // arrow left
            if (scroll_left > (table.width()-c_table_w))
            {
                var scroll = table.scrollLeft();
                scroll     = scroll + ((table.width()-c_table_w) - scroll_left);
                table.scrollLeft(scroll);
            }
        }
    };

    // 수정된 엘리먼트 렌더링
    Plugin.prototype.domLender = function(info) {
        console.log("domLender");
        console.log(info);
    };

    // html 테이블에서 데이터를 파싱
    Plugin.prototype.parser = function() {
    };

    //Table Scroll 동기화
    Plugin.prototype.setSyncScroll = function() {
        // table horizontal scroll 동기화
        $(".jsheet-table-body").scroll(function(event) {
            $(".jsheet-table-header").scrollLeft($(this).scrollLeft());
            $(".jsheet-table-body-fixed").scrollTop($(this).scrollTop());
        });

        // table cell height 동기화 (original - cloned table)
        $(".jsheet-table-body").find("tr").each(function(index, el) {
            $( ".fixed-cell:nth-child("+index+")" ).height($(el).height());
        });
    };

    Plugin.prototype.ajax = function(info) {
        var _plugin = this;

        return $.ajax({
            dataType: this.options.dataType,
            url: info.url,
            data: info.data,
            beforeSend: function() {
                window.loader.create(info.loader_options);
            },
            success: function(result) {
                _plugin.func(info.func, result);
            },
            complete: function() {
                window.loader.remove();
            },
        });
    };

    /** * ----------------------------------------------------------------------
     * Functions for function calls in plugin
     * How to use(사용법) - this.func(funcionName, data)
     * @param {string} funcName
     * @param {object} data
     *
     * @return {function} Return Calling functions within plugin
     * -----------------------------------------------------------------------*/
    Plugin.prototype.func = function(funcName, data) {
        return this[funcName](data);
    };

    /** * ----------------------------------------------------------------------
     * 생성자(예. new Plugin()) 주변에 여러개의 인스턴스 생성을 방지하기 위해
     * 가벼운 플러그인 래퍼를 설정합니다.
     * data 메소드를 이용하여 cache 해 두게 됩니다.
     * (한번 생성된 인스턴스는 더이상 같은 인스턴스를 생성하지 않도록 하기 위함입니다.)
     * -----------------------------------------------------------------------*/
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                    new Plugin(this, options));
            }
        });
    }

})(jQuery, window, document);