$( window ).on( 'load', function() {
    $('.document-loader').fadeOut('fast', null)

    const owlCarousel = $('.owl-carousel')
    if( owlCarousel.length > 0 ){
        owlCarousel.owlCarousel({
            dots: false,
            nav: true,
            loop: true,
            margin: 10,
            lazyLoad: true,
            responsiveClass: true,
            responsive: {
            0: { items: 2, nav: true },
            600: { items: 3, nav: false },
            1000: { items: 5, nav: true, loop: false, margin: 20 }
            }
        })
    }

    const awesomplete = document.getElementById('username-awesomplete')
    if(awesomplete != null){
        (async function () {
            new Awesomplete(awesomplete, {
                minChars: 2,
                list: await getUsers()
            })
        }())
    }

    async function getUsers(){
        const users = await fetch('http://localhost:3300/api/users')
        .then(res => res.json())
        .then(data => data)
        return users
    }

})