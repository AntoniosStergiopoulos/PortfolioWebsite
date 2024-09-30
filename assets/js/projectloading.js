let preloadedImages = [];

$(document).ready(function() {

    // Function to update the media viewer
    window.updateMediaViewer = function(src, type, description) {
        var mediaViewer = document.querySelector('.media-viewer');
        mediaViewer.innerHTML = '';  // Clear previous content
    
        if (type === 'image') {
            const img = document.createElement('img');
            img.src = src;
            mediaViewer.appendChild(img);
        } else if (type === 'video') {
            const videoContainer = document.createElement('div');
            videoContainer.className = 'video-container';
    
            const videoWrapper = document.createElement('div');
            videoWrapper.className = 'video-wrapper';
    
            const iframe = document.createElement('iframe');
            iframe.src = src;
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            iframe.setAttribute('allowfullscreen', '');
    
            videoWrapper.appendChild(iframe);
            videoContainer.appendChild(videoWrapper);
            mediaViewer.appendChild(videoContainer);
        }
    
        // Update the media header description
        const mediaHeaderDescription = document.querySelector('.media-header p');
        mediaHeaderDescription.textContent = description;
    }
    

    // Function to create project items from JSON data
    function createProjectItems(data) {
        if (data && data.projects && Array.isArray(data.projects)) {
            data.projects.forEach(function(project) {
                var projectHtml = '<div class="grid-item col-md-4 col-sm-6 col-xs-12 ' + project.category + '">' +
                    '<figure>' +
                    '<img src="' + project.imageUrl + '" alt="Project Image">' +
                    '<figcaption class="fig-caption">' +
                    '<i class="fas fa-search"></i>' +
                    '<h5 class="title">' + project.titleUrl + '</h5>' +
                    '<span class="sub-title">' + project.subtitleUrl + '</span>' +
                    '<a href="javascript:;" data-fancybox-project data-project-id="' + project.Id + '"></a>' +
                    '</figcaption>' +
                    '</figure>' +
                    '</div>';
                $('#project-gallery .portfolioContainer').append(projectHtml);
                var $container = $('.portfolioContainer');
                $container.isotope('reloadItems').isotope();
            });
        } else {
            console.error('Error fetching project data: Array not found');
        }
    }

    // Function to handle clicking on a project item
    function setupProjectClickHandler() {
        $("[data-fancybox-project]").on('click', function(e) {
            e.preventDefault();  // Prevent the default link behavior
            var projectId = $(this).data('project-id');
        
            // Load project details from JSON file
            $.getJSON('assets/data/projects.json', function(data) {
                var project = data.projects.find(p => p.Id === projectId);
                if (project) {
                    loadProjectContent(project);
                    
                    // Now open the FancyBox modal
                    $.fancybox.open({
                        src  : '#project-modal',
                        type : 'inline',
                        opts : {
                            afterShow : function( instance, current ) {
                                console.info('done!');
                            },
                            afterClose: function() {
                                // Explicitly hide the loading icon
                                // $('.fancybox-container').hide();

                                // Clear preloaded images
                                // clearPreloadedImages();
                            }
                        }
                    });
                }
            });
        });
    }

    function loadProjectContent(project) {
       // Thumbnails HTML
       var thumbnailHtml = '';
       if (project.videos) {
           thumbnailHtml += project.videos.map((video, index) => {
               if (video.url) {
                   const videoId = video.url.split('embed/')[1];
                   return `
                       <div class="thumbnail video-thumbnail" data-description="${video.description}" onclick="updateMediaViewer('${video.url}', 'video', '${video.description}')">
                           <div class="image-container">
                               <img src="https://i.ytimg.com/vi_webp/${videoId}/mqdefault.webp" alt="Video Thumbnail ${index}" data-video-src="${video.url}">
                               <div class="play-icon">
                                   <div class="background"></div>  <!-- Add this line -->
                                   <i class="fa fa-brands fa-youtube" aria-hidden="true"></i>
                               </div>
                           </div>
                       </div>
                   `;
               }
               return '';  // Return empty string if video.url is not defined
           }).join('');
       }

        // Images HTML
        if (project.images) {
            thumbnailHtml += project.images.map((img, index) => {
                if (img.url) {
                    // Extract the name of the original image and append "_mini.webp" to it
                    let thumbnailUrl = img.url.replace(/\.[^/.]+$/, "_mini.webp");
                    return `
                        <div class="thumbnail" data-description="${img.description}" onclick="updateMediaViewer('${img.url}', 'image', '${img.description}')">
                            <div class="image-container">
                                <img src="${thumbnailUrl}" alt="Thumbnail Image ${index}" data-original-src="${img.url}">
                            </div>
                        </div>
                    `;
                }
                return '';  // Return empty string if img.url is not defined
            }).join('');
        }        
        
         // Buttons HTML
        var buttonsHtml = '';
        if (project.buttons) {
            buttonsHtml = project.buttons.map(button => {
                if (button.url && button.name) {
                    return `<a href="${button.url}" target="_blank" class="btn">${button.name}</a>`;
                }
                return '';  // Return empty string if button.url or button.name is not defined
            }).join('');
        }
                
                // Build the content HTML
                var content = `
                    <div class="left-column">
                        <div class="media-header">
                            <h2>${project.title}</h2>
                            <p>${project.description}</p>
                        </div>
                        <div class="media-viewer">
                            <!-- Selected Image/Video will be displayed here -->
                        </div>
                        <div class="media-thumbnails">
                            ${thumbnailHtml}
                        </div>
                    </div>
                    <div class="right-column">
                        <div class="project-image">
                            <img src="${project.imageUrl}" alt="Project Image">
                        </div>
                        <div class="project-description">
                            <p>${project.description}</p>
                        </div>
                        <div class="project-tags">
                            <div class="tags-content">
                                ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
                            </div>
                        </div>
                        <div class="project-buttons">
                            <div class="buttons-content">
                                ${buttonsHtml}
                            </div>
                        </div>
                    </div>
                `;
                
                // Insert the content into the modal
                $('#project-modal .mh-portfolio-modal-inner').html(content);
                
                // Preload images
                // preloadProjectImages(project);

                // Trigger a click event on the first thumbnail to set the default view
                updateMediaViewerOnThumbnailClick();
            }
    
    function updateMediaViewer(src, type, description) {
        $('.media-viewer').empty();  // Clear previous content

        if (type === 'image') {
            const img = $('<img>').attr('src', src);
            $('.media-viewer').append(img);
        } else if (type === 'video') {
            const videoContainer = $('<div>').addClass('video-container');
            const videoWrapper = $('<div>').addClass('video-wrapper');
            const iframe = $('<iframe>').attr({
                src: src,
                frameborder: '0',
                allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                allowfullscreen: ''
            });

            videoWrapper.append(iframe);
            videoContainer.append(videoWrapper);
            $('.media-viewer').append(videoContainer);
        }

        // Update the media header description
        $('.media-header p').text(description);
    }

    function updateMediaViewerOnThumbnailClick() {
        $('.thumbnail').on('click', function() {
            // Remove the selected class from all thumbnails
            $('.thumbnail').removeClass('selected');
            
            // Add the selected class to the clicked thumbnail
            $(this).addClass('selected');
            
            // Check if the thumbnail is a video thumbnail
            if ($(this).hasClass('video-thumbnail')) {
                // Update the media viewer with the video
                let videoSrc = $(this).find('img').data('video-src');
                let videoDescription = $(this).data('description');
                updateMediaViewer(videoSrc, 'video', videoDescription);
            } else {
                // Update the media viewer with the image
                let imgSrc = $(this).find('img').data('original-src');
                let imgDescription = $(this).data('description');
                updateMediaViewer(imgSrc, 'image', imgDescription);
            }
        });

        // Trigger a click event on the first thumbnail to set the default view
        $('.thumbnail').first().click();
    }

    // Define the filtering setup function
    function setupFiltering($container) {
        $('.portfolio-nav li').click(function() {
            $('.portfolio-nav .current').removeClass('current');
            $(this).addClass('current');
    
            var selector = $(this).attr('data-filter');
            $container.isotope({
                filter: selector,
                animationOptions: {
                    queue: true
                }
            });
            return false;  // Prevents the default action for the click event
        });
    }

    // function preloadProjectImages(project) {
    //     // Start by loading the project image
    //     const projectImageUrl = [project.imageUrl];
    
    //     // Then load the media-thumbnails
    //     const thumbnailUrls = project.images ? project.images.map(img => img.url.replace(/\.[^/.]+$/, "_mini.webp")) : [];
    
    //     // Lastly, load all the images that are destined to be viewed in the media-viewer (original-src)
    //     const mediaViewerImageUrls = project.images ? project.images.map(img => img.url) : [];
    
    //     // Combine all URLs into a single array
    //     const allUrls = projectImageUrl.concat(thumbnailUrls, mediaViewerImageUrls);
    
    //     // Preload all images
    //     preloadedImages = preloadImages(allUrls);
    // }

    // function preloadImages(urls) {
    //     const preloadedImages = [];
    //     urls.forEach(url => {
    //         const img = new Image();
    //         img.src = url;
    //         preloadedImages.push(img);
    //     });
    //     return preloadedImages;
    // }

    // function clearPreloadedImages() {
    //     preloadedImages.length = 0;  // This clears the array while keeping the original reference
    // }

    function preloadImage(url) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => {
                preloadedImages.push(img);
                resolve(url);
            };
            img.onerror = reject;
            img.src = url;
        });
    }

    async function preloadProjectImages(project) {
        // Preload imageUrl
        // await preloadImage(project.imageUrl);
    
        // Preload thumbnails
        for (let image of project.images) {
            let thumbnailUrl = image.url.replace(/\.[^/.]+$/, "_mini.webp");
            await preloadImage(thumbnailUrl);
        }
    
        // Preload media-viewer images
        for (let image of project.images) {
            await preloadImage(image.url);
        }
    }
    
    
    var hasTriggeredClick = false;  // Flag to track if the click has been triggered

    $(window).on('scroll', function() {
        // Get the offset position of the #mh-portfolio section
        var portfolioOffset = $('#mh-portfolio').offset().top;
        
        // Check if the user has scrolled to the #mh-portfolio section and hasn't triggered the click yet
        if ($(window).scrollTop() + $(window).height() > portfolioOffset && !hasTriggeredClick) {
            hasTriggeredClick = true;  // Update the flag
            $('.portfolio-nav li[data-filter="*"]').click();  // Trigger the click on "All Projects" button
        }
    });    

    // Fetch the JSON data, then create the project items and setup the click handler
    $.ajax({
        url: 'assets/data/projects.json',
        dataType: 'json',
        success: function(data) {
            // Preload project.imageUrl images for all projects first
            data.projects.forEach(project => {
            preloadImage(project.imageUrl);  // No await here
            });
            // Now preload the other images for each project
            data.projects.forEach(project => {
            preloadProjectImages(project);  // No await here
            });
            createProjectItems(data);
            setupProjectClickHandler();  // Now setup the click handler
            // Now initialize Isotope
            var $container = $('.portfolioContainer');
            $container.isotope({
                itemSelector: '.grid-item',
                filter: '*',
                animationOptions: {
                    queue: true
                }
            });
            setupFiltering($container);  // Now setup the filtering

            // First preload all project.imageUrl
            // Promise.all(data.projects.map(project => preloadImage(project.imageUrl)))
            // .then(() => {
            //     // After all project.imageUrl are preloaded, preload images for each project
            //     return Promise.all(data.projects.map(project => preloadProjectImages(project)));
            // })
            // .catch(error => {
            //     console.error('Error preloading images:', error);
            // });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching project data:', errorThrown);
        }
    });
});

