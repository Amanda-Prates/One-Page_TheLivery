(function($){

    $.fn.slidemultiplo = function(data, callback){

        var $slidemultiplo = $(this);
        var $destaque = $slidemultiplo.find('.MS-content');
        var $botaodireita = $slidemultiplo.find('button.MS-right');
        var $botaoesquerda = $slidemultiplo.find('button.MS-left');
        var $imagem1 = $destaque.find('.item:first');

        if(typeof data === 'string'){
            getStringArgs(data);
            return $slidemultiplo;
        } else if (typeof data === 'object' || typeof data  ==='undefined'){
            init();
        }

        var $imagemult,
        tamanhototal,
        numeracaoslides,
        animacao,
        animacaodireita,
        animacaoesquerda,
        defaults,
        settings,
        duracao,
        intervaloslides;

        function init(){
            minifyContent();        
            createSettings();       
            saveData();
            selectAnimations();}

        $botaodireita.on('click', animacaoesquerda);
        $botaoesquerda.on('click', animacaodireita);
        $slidemultiplo.on('click','.MS-right, .MS-left', resetInterval);
        $(window).on('resize', findItemWidth);

        function pauseAbove(){
            if (window.innerWidth > settings.pauseAbove){ $slidemultiplo.addClass('ms-PAUSE'); }
            $(window).on('resize',function(){
                if (window.innerWidth > settings.pauseAbove){
                    $slidemultiplo.addClass('ms-PAUSE');
                } else {
                    $slidemultiplo.removeClass('ms-PAUSE');
                }
            });
        }

        function pauseBelow(){
            if (window.innerWidth < settings.pauseBelow){ $slidemultiplo.addClass('ms-PAUSE'); }
            $(window).on('resize',function(){
                if (window.innerWidth < settings.pauseBelow){
                    $slidemultiplo.addClass('ms-PAUSE');
                } else {
                    $slidemultiplo.removeClass('ms-PAUSE');
                }
            });
        }

        function getStringArgs(str){
            if (typeof $slidemultiplo.data(str) !== 'undefined'){
                $slidemultiplo.data(str)();
            } else {
                console.error("slidemultiplo currently only accepts the following methods: next, prev, pause, play");
            }
        }

        function saveData(){
            $slidemultiplo.data({
                "pause":function(){ $slidemultiplo.addClass('ms-PAUSE'); },
                "unPause":function(){ $slidemultiplo.removeClass('ms-PAUSE'); },
                "continuous":function(){ $slidemultiplo.removeClass('ms-PAUSE'); continuousLeft(); },
                "next":function(){ overRidePause(singleLeft); },
                "nextAll":function(){ overRidePause(allLeft); },
                "prev":function(){ overRidePause(singleRight); },
                "prevAll":function(){ overRidePause(allRight); },
                "settings":settings
            });
        }

        function overRidePause(animation){
            if ($slidemultiplo.hasClass('ms-PAUSE')){
                $slidemultiplo.removeClass('ms-PAUSE');
                animation();
                $slidemultiplo.addClass('ms-PAUSE');
            } else {
                animation();
            }
            resetInterval();
        }

        function minifyContent(){
            $destaque.contents().filter(function(){
                return (this.nodeType == 3 && !/\S/.test(this.nodeValue));
            }).remove();
        }
        function createSettings() {
            defaults = settings || {
    			continuous: false,	
    			slideAll: false,	
    			interval: 2000,		
    			duration: 500,	    
    			hoverPause: true,	
                pauseAbove: null,   
                pauseBelow: null    
    		};

    		settings = $.extend({},defaults,data);

            findItemWidth();
            duracao = settings.duration;

            if (settings.hoverPause){pauseHover();}
            if (settings.continuous !== true && settings.interval !== 0 && settings.interval !== false && settings.autoSlide !== false){autoSlide();}
            if (settings.pauseAbove !== null && typeof settings.pauseAbove === 'number'){ pauseAbove(); }
            if (settings.pauseBelow !== null && typeof settings.pauseBelow === 'number'){ pauseBelow(); }
        }
        function selectAnimations () {
            if (settings.continuous){
                settings.autoSlide = false;
                continuousLeft();
            } else if (settings.slideAll){
                animacaodireita = $slidemultiplo.data('prevAll');
                animacaoesquerda = $slidemultiplo.data('nextAll');
            } else {
                animacaodireita = $slidemultiplo.data('prev');
                animacaoesquerda = $slidemultiplo.data('next');
            }
        }
        function findItemWidth(){
            reTargetSlides();
            animacao = $imagem1.width();
            var left = parseInt($destaque.find('.item:first').css('padding-left'));
            var right = parseInt($destaque.find('.item:first').css('padding-right'));
            if (left !== 0){animacao += left;}
            if (right !== 0){animacao += right;}
        }
        function autoSlide() {
            intervaloslides = setInterval(function(){
                if (!$slidemultiplo.hasClass('ms-PAUSE')){
                    animacaoesquerda();
                }
            }, settings.interval);
        }

        function resetInterval() {
            if (settings.interval !== 0 && settings.interval !== false && settings.continuous !== true){
                clearInterval(intervaloslides);
                autoSlide();
            }
        }
        function reTargetSlides(){
            $imagem1 = $destaque.find('.item:first');
            $imagemult = $destaque.find('.item:last');
        }
        function isItAnimating(callback){
			if(!$slidemultiplo.hasClass('ms-animating') &&
               !$slidemultiplo.hasClass('ms-HOVER') &&
               !$slidemultiplo.hasClass('ms-PAUSE')){
                    $slidemultiplo.trigger('ms.before.animate'); 
                    $slidemultiplo.addClass('ms-animating');
                    callback();    
			}
		}

        function doneAnimating() {
			if($slidemultiplo.hasClass('ms-animating')){
				$slidemultiplo.removeClass('ms-animating');
                $slidemultiplo.trigger('ms.after.animate'); 
            }
		}

        
        function pauseHover() {

            if(settings.continuous){
				$destaque.on('mouseover',function(){
					doneAnimating();
					$destaque.children('.item:first').stop();
				});
				$destaque.on('mouseout',function(){
					continuousLeft();
				});
			} else {

                $destaque.on('mouseover',function(){
                    $slidemultiplo.addClass('ms-HOVER');
                });
                $destaque.on('mouseout',function(){
                    $slidemultiplo.removeClass('ms-HOVER');
                });
			}
        }

        function midAnimateResume(){
            duracao = settings.duration;
            var currentMargin = parseFloat($destaque.find('.item:first').css("margin-left"));
            var percentageRemaining = 1-(currentMargin/-(animacao-1));
            duracao = percentageRemaining*duracao;
        }

        function calcNumSlidesToMove(){
            tamanhototal = $destaque.width();						          
		    numeracaoslides = Math.floor(tamanhototal/animacao);     
        }

        function continuousLeft () {
            isItAnimating(function(){
                reTargetSlides();
                midAnimateResume();
                $imagem1.animate(
                    {marginLeft: -(animacao+1)},
                    {
                        duration: duracao,
                        easing: "linear",
                        complete: function(){
                            $imagem1.insertAfter($imagemult).removeAttr("style");
                            doneAnimating();
                            continuousLeft ();
                        }
                    }
                );
            });
        }

        function allLeft(){
            isItAnimating(function(){
                reTargetSlides();
                calcNumSlidesToMove();

                var $clonedItemSet = $destaque.children('.item').clone();
                var filteredClones = $clonedItemSet.splice(0, numeracaoslides);

                $destaque.append(filteredClones);

                $imagem1.animate(
                    {marginLeft: -tamanhototal}, {
                        duration: duracao,
                        easing: "swing",
                        complete: function(){
                            $($destaque.children('.item').splice(0,numeracaoslides)).remove();
                            doneAnimating();
                        }
                    }
                );
            });
        }

        function allRight() {
            isItAnimating(function(){
                reTargetSlides();
                calcNumSlidesToMove();

                var numberTotalSlides = $destaque.children('.item').length;
                var $clonedItemSet = $destaque.children('.item').clone();
                var filteredClones = $clonedItemSet.splice(numberTotalSlides-numeracaoslides,numberTotalSlides);

                $($(filteredClones)[0]).css('margin-left',-tamanhototal); 
                $destaque.prepend(filteredClones);

                reTargetSlides();

                $imagem1.animate(
                    {
                        marginLeft: 0
                    }, {
                        duration: duracao,
                        easing: "swing",
                        complete: function(){
                            numberTotalSlides = $destaque.find('.item').length;
                            $($destaque.find('.item').splice(numberTotalSlides-numeracaoslides,numberTotalSlides)).remove();
                            $imagem1.removeAttr('style');
                            doneAnimating();
                        }
                    }
                );
            });
        }

        function singleLeft(){
            isItAnimating(function(){
                reTargetSlides();
                $imagem1.animate(
                    {
                        marginLeft: -animacao
                    }, {
                        duration: duracao,
                        easing: "swing",
                        complete: function(){
                            $imagem1.detach().removeAttr('style').appendTo($destaque);
                            doneAnimating();
                        }
                    }
                );
            });
        }

        function singleRight(){
            isItAnimating(function(){
                reTargetSlides();
                $imagemult.css('margin-left',-animacao).prependTo($destaque);
                $imagemult.animate(
                    {
                        marginLeft: 0
                    }, {
                        duration: duracao,
                        easing: "swing",
                        complete: function(){
                            $imagemult.removeAttr("style");
                            doneAnimating();
                        }
                    }
                );
            });
        } 
        return $slidemultiplo;
    }
})(jQuery);