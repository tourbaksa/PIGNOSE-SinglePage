/****************************************
*
*  - PIGNOSE SinglePage JS
*  - DATE    2014-10-22
*  - AUTHOR  PIGNOSE
*  - VERSION 0.0.3
*  - LICENCE MIT
*
****************************************/

(function($) {
	// Plugin common configuration.
	var _config = {
		name:       'PIGNOSE SinglePage JS',
		createDate: '2014-10-22',
		updateDate: '2014-10-27',
		version:    '0.0.3',
		author:     'kenneth ceyer',
		email:      'kennethan@nhpcw.com',
		dev:        {
			handler: '.pignoseSpageHandler'
		},
		plugin:     {
			active:            0,
			oldActive:         null,
			count:             0,
			direction:         'down',
			oldSection:        null,
			currentSection:    null,
			wrapperSection:    null,
			itemSections:      null,
			scrollTop:         0,
			staticScrollTop:   0,
			relativeScrollTop: 0,
			relativePercent:   0,
			supportCss3:       false,
			using:             false
		}
	};

	// Abstract OOP plugin struct.
	var _interface = {
		_throw: function(error, errno) {
			$.error("'" + _config.name + "' load failed (" + errno + "): " + error);
		},
		_bind: function(object, handler, func, niife) {
			var _handler = handler.replace(/(\w+(?=\s)?)/gi, '$1' + _config.dev.handler), niife = niife || false;
			object.unbind(_handler).bind(_handler, func);
			if(!!niife === true) {
				object.triggerHandler(_handler);
			}
			return object;
		},
		_trigger: function(object, handler) {
			var _handler = handler.replace(/(\w+(?=\s)?)/gi, '$1' + _config.dev.handler);
			object.triggerHandler(_handler);
		},
		_excute: function(func, args) {
			if(typeof func === 'function' && func != null) {
				func.call(_config.plugin.currentSection, args);
			}
		},
		_extend: function(object, func) {
			var _args = arguments;
			if(typeof object === 'object' && object != null) {
				object[func] = function() {
					_interface[func].apply(this, Array.prototype.slice.call(_args, 2));
				};
			}
		},
		// Define contruction method.
		init: function(options) {
			var opt = $.extend({
				animateTime:    880,
				animateEasing:  'easeInQuad',
				scrollGap:      10,
				continuous:     true,
				section:        $('.section'),
				padding: {
					top:    0,
					right:  0,
					bottom: 0,
					left:   0
				},
				navigation:     $(document),
				responsive:         true,
				overflowScroll:     true,
				useCss3:            false,
				leastHeight:        true,
				parallaxBackground: false,
				parallaxRatio:      [0.2575],
				onAfterLoad:        null,
				onBeforeScroll:     null,
				onAfterScroll:      null,
				onHashChange:       null,
				onPaging:           null,
				onScrolling:        null,
				onResize:           null,
				onEndPage:          null
			}, options), $this = $(this);

			// Validate critical params.
			if($(this).length < 1) {
				_interface._throw('target element is not found.', 1001);
			}

			opt.padding.top    = parseInt(opt.padding.top     || 0);
			opt.padding.right  = parseInt(opt.padding.right   || 0);
			opt.padding.bottom = parseInt(opt.padding.bottom) || 0;
			opt.padding.left   = parseInt(opt.padding.left    || 0);
			
			// Apply rendering to the all sections.
			_config.plugin.itemSections   = $this.find(opt.section), $window = $(window), $document = $(document);
			_config.plugin.oldSection     = _config.plugin.currentSection = _config.plugin.itemSections.eq(_config.plugin.active);
			_config.plugin.wrapperSection = $this;
			_config.plugin.count          = _config.plugin.itemSections.length;
			_interface.extend(opt);
			_interface.render.call(_config.plugin.itemSections, opt);
			_interface._excute(opt.onAfterLoad, _config.plugin);
			return $this;
		},
		extend: function(opt) {
			 var s = (document.body || document.documentElement).style, $window = $(window), $document = $(document);
			 _config.plugin.supportCss3 = (s.transition !== undefined || s.WebkitTransition !== undefined || s.MozTransition !== undefined || s.MsTransition !== undefined || s.OTransition !== undefined);
			_interface._bind($window, 'load', function() {
				$window.triggerHandler('resize');
			});

			if(!$.isFunction($.easing[opt.animateEasing])) {
				$.extend($.easing, {
					easeInQuad: function(x, t, b, c, d) {
						return c*(t/=d)*t + b;
					}
				});
			}

			_interface._bind(opt.navigation.find('a[href^="#"]'), 'click', function(event) {
				if(!new RegExp(/^#(\w)+/gi).test($(this).attr('href'))) {
					return false;
				}
				_config.plugin.using = false;

				_interface.setHash($(this).attr('href').replace(/#+/g, ''));
				event.preventDefault();
			})

			if(typeof $.mousewheel === 'undefined') {
				var a = ['DOMMouseScroll', 'mousewheel'];
				$.event.special.mousewheel = {
					setup : function() {
						if (this.addEventListener) {
							for (var d=a.length; d;) {
								this.addEventListener(a[--d], b, false);
							}
						}
						else {
							this.onmousewheel = b;
						}
					},
					teardown : function() {
						if (this.removeEventListener) {
							for ( var d = a.length; d;) {
								this.removeEventListener(a[--d], b, false);
							}
						}
						else {
							this.onmousewheel = null;
						}
					}
				};

				$.fn.extend({
					mousewheel : function(d) {
						return d? this.bind("mousewheel", d) : this.trigger("mousewheel");
					},
					unmousewheel : function(d) {
						return this.unbind("mousewheel", d);
					}
				});

				function b(f) {
					
					var d = [].slice.call(arguments, 1), g = 0, e = true, f = f || window.event;
					if (f.wheelDelta) {
						g = f.wheelDelta / 120
					}
					if (f.detail) {
						g = -f.detail / 3
					}
					f       = $.event.fix(f || window.event);
					f.type  = "mousewheel";
					f.pageX = f.originalEvent.pageX;
					f.pageY = f.originalEvent.pageY;
					d.unshift(f, g);
					return $.event.dispatch.apply(this, d);
				}
			}

			_interface._bind($document, 'mousewheel', function(event, delta) {
				if(_config.plugin.using === true) {
					return false;
				}
				_config.plugin.using = true;

				if(delta > 0) {
					_config.plugin.direction = 'up';
				}
				else {
					_config.plugin.direction = 'down';
				}
				_interface.moveSet.call(_config.plugin.itemSections, opt);
			});

			_interface._bind($window, 'hashchange', function(event) {
				var hash;
				_config.plugin.oldActive  = _config.plugin.active;
				_config.plugin.oldSection = _config.plugin.currentSection;
				if(!new RegExp(/^#!\/.+/gi).test(location.hash)) {
					hash = _config.plugin.currentSection.attr('id');
				}
				else {
					hash = location.hash.replace(/^#!\//, '');
					_config.plugin.currentSection = _config.plugin.wrapperSection.find('#' + hash);
					if(_config.plugin.currentSection.length > 0) {
						_config.plugin.active = _config.plugin.currentSection.index();
					}
				}
				_config.plugin.direction = 'refresh';
				_interface._excute(opt.onHashChange, _config.plugin);
				_interface.moveScroll.call(_config.plugin.wrapperSection.find(opt.section), opt);
			});

			_interface._bind($window, 'resize', function(event) {
				_config.plugin.oldActive = _config.plugin.active;
				_interface.setPage.call(_config.plugin.itemSections, opt);
				_interface._excute(opt.onResize, _config.plugin);
			});

			_interface._bind(_config.plugin.itemSections, 'scroll', function(event) {
				var $this = $(this);
				if($this.hasClass('active')) {
					_config.plugin.relativeScrollTop = $this.scrollTop();
					_config.plugin.relativePercent = (_config.plugin.relativeScrollTop) / _config.plugin.currentSection.outerHeight();
					_interface._excute(opt.onScrolling, _config.plugin);
				}
			});

			_interface._extend(_config.plugin.wrapperSection, 'setMoveUp', opt);
			_interface._extend(_config.plugin.wrapperSection, 'setMoveDown', opt);
		},
		render: function(opt) {
			var _this = this, $window = $(window), $document = $(document), $html = $('html'), $body = $('body');
			$html.add($body).css({
				overflowY: 'hidden'
			});

			_this.css({
				overflow:  'hidden'
			});

			if(_config.plugin.supportCss3 === true && opt.useCss3 === true) {
				_this.css({
					'-o-transition':      'all ' + opt.animateTime + 'ms ease',
					'-moz-transition':    'all ' + opt.animateTime + 'ms ease',
					'-webkit-transition': 'all ' + opt.animateTime + 'ms ease',
					'transition':         'all ' + opt.animateTime + 'ms ease'
				});
			}

			_this.each(function() {
				var $this = $(this);
				$this.removeAttr('style').css({
					paddingTop:    opt.padding.top,
					paddingRight:  opt.padding.right,
					paddingBottom: opt.padding.bottom,
					paddingLeft:   opt.padding.left,
					position:      'relative',
					overflow:      'hidden'
				});

				if(opt.overflowScroll === true) {
					$this.css({
						overflowY: 'auto'
					});
				}
			});
			
			_interface._trigger($window, 'hashchange');
			_interface.setPage.call(_this, opt);
		},
		moveSet: function(opt, ext) {
			var active = _config.plugin.active;
			if(_config.plugin.direction !== 'refresh') {
				var deltaCalc = (_config.plugin.direction === 'up')? 1 : -1, _ext = ext || false;
				if(((   _config.plugin.active - deltaCalc < 0 &&
						_config.plugin.direction === 'up' ) ||
					(   _config.plugin.active - deltaCalc >= _config.plugin.count &&
						_config.plugin.direction === 'down' )
				) && opt.continuous !== true) {
					return false;
				}
				else if((( _config.plugin.direction === 'up' &&
						 (_config.plugin.currentSection.scrollTop() > (0 + opt.scrollGap)) ) ||
						( _config.plugin.direction === 'down' &&
						 (_config.plugin.currentSection.scrollTop() + _config.plugin.currentSection.innerHeight()) < (_config.plugin.currentSection[0].scrollHeight - opt.scrollGap)
						)) && opt.overflowScroll && _ext === false) {
					_config.plugin.using = false;
					return false;
				}
				else {
					active -= deltaCalc;
				}
			}

			active = (_config.plugin.active < 0)? _config.plugin.count - 1 : active % _config.plugin.count;
			_interface.setHash(this.eq(active).attr('id'));
		},
		moveScroll: function(opt) {
			var targetTop, diffTop = 0, oldTop = _config.plugin.oldSection.position().top, diffOrigin, offsetOrig = _config.plugin.active - _config.plugin.oldActive, offset = Math.abs(offsetOrig);
			_config.plugin.currentSection = this.eq(_config.plugin.active);
			_config.plugin.currentSection.addClass('active').siblings('.active').removeClass('active');
			_interface.setCurrent(_config.plugin.currentSection.attr('id'), opt);
			_interface._excute(opt.onBeforeScroll, _config.plugin);
			targetTop = _config.plugin.currentSection.position().top;
			diffOrigin = targetTop - oldTop;

			if(_config.plugin.supportCss3 === true && opt.useCss3 === true) {
				_config.plugin.staticScrollTop = targetTop += _config.plugin.scrollTop;
				_config.plugin.wrapperSection.css({
					transform: 'translate3d(0, ' + -targetTop + 'px, 0)'
				});

				setTimeout(function() {
					_config.plugin.scrollTop = targetTop;
					_config.plugin.using = false;
					_interface._excute(opt.onAfterScroll, _config.plugin);
					if(_config.plugin.active == _config.plugin.count - 1) {
						_interface._excute(opt.onEndPage, _config.plugin);
					}
				}, opt.animateTime);
			}
			else {
				_config.plugin.staticScrollTop = targetTop;
				_config.plugin.wrapperSection.stop().animate({marginTop: -targetTop}, {
					duration: opt.animateTime,
					progress: function(a, p, r) {
						_config.plugin.scrollTop        += (targetTop - oldTop) * p - diffTop;
						_config.plugin.relativeScrollTop = (targetTop - oldTop) * p;
						_config.plugin.relativePercent   = _config.plugin.relativeScrollTop / _config.plugin.currentSection.outerHeight();
						if(diffOrigin != 0 && _config.plugin.relativePercent != 0 && p != 0) {
							_config.plugin.relativePercent = (_config.plugin.relativePercent <= 0)? _config.plugin.relativePercent + offset : _config.plugin.relativePercent - offset;
						}
						else {
							_config.plugin.relativePercent = -offsetOrig;
						}
						diffTop = (targetTop - oldTop) * p;
						_interface._excute(opt.onPaging, _config.plugin);
						if(opt.parallaxBackground === true) {
							_interface.setBackgroundParallaxing(opt);
						}
					},
					easing: opt.animateEasing,
					complete: function() {
						_config.plugin.scrollTop = targetTop;
						_config.plugin.wrapperSection.css({marginTop: -targetTop});
						_config.plugin.using = false;
						_interface._excute(opt.onAfterScroll, _config.plugin);

						if(_config.plugin.active == _config.plugin.count - 1) {
							_interface._excute(opt.onEndPage, _config.plugin);
						}
					}
				});
			}
		},
		setPage: function(opt) {
			var _this = this, $window = $(window);
			_this.each(function() {
				var $this = $(this), _width = $window.width(), _height = $window.height();
				$this.css({width: '', minWidth: '', height: '', minHeight: '', paddingTop: opt.padding.top, paddingBottom: opt.padding.bottom});
				if(opt.leastHeight === true) {
					var targetHeight = Math.min(_height, $this.outerHeight()), _padding = (_height - targetHeight) / 2;
					$this.css({
						paddingTop:    opt.padding.top    + _padding,
						paddingBottom: opt.padding.bottom + _padding
					});
				}
				$this.outerWidth(_width).outerHeight(_height);
			});
			_config.plugin.oldSection = _config.plugin.currentSection;
			_config.plugin.direction  = 'refresh';
			_interface.moveScroll.call(_this, opt);
		},
		setCurrent: function(id, opt) {
			if(opt.navigation.length > 0) {
				var navigations = opt.navigation.find('a[href^="#"]');
				navigations.filter('.active').removeClass('active');
				navigations.filter('[href="#' + id + '"]').addClass('active');
			}
		},
		setHash: function(hash) {
			if(!new RegExp(/^#!\/(\w)+/gi).test(hash)) {
				hash = '#!/' + hash;
			}
			document.location.hash = hash;
		},
		setMoveUp: function(opt) {
			_config.plugin.direction = 'up';
			_interface.moveSet.call(_config.plugin.itemSections, opt, true);
		},
		setMoveDown: function(opt) {
			_config.plugin.direction = 'down';
			_interface.moveSet.call(_config.plugin.itemSections, opt, true);
		},
		setBackgroundParallaxing: function(opt) {
			var top = _config.plugin.relativePercent * opt.parallaxRatio[opt.parallaxRatio.length - 1] * _config.plugin.currentSection.outerHeight();
			if(_config.plugin.currentSection.css('background-image')) {
				_config.plugin.currentSection.css({
					backgroundPosition: 'center ' + top + 'px'
				});
			}
		}
	};

	// jQuery controller layer.
	$.fn.pignoseSpage = function(options) {
		var ERROR_FLAG = 0x01;

		if(typeof _interface[options] === 'function') {
			return _interface[options].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if(typeof options === 'object' || !options) {
			return _interface.init.apply(this, arguments);
		}
		else {
			// Throws error exception.
			_interface._throw('an error has occurred in initialization.', 0);
			return ERROR_FLAG;
		}
	};
})(jQuery);