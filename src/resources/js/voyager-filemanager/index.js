import FileManager from "./FileManager";

export default function (config) {
    const { hooks, element } = window.wp
    const { Component } = element

    class VoyagerFilemanager extends Component {
        constructor (props) {
            super(props)

            this.state = {
                media: []
            }

            this.root = document.querySelector('#VoyagerFileManager')

            ReactDOM.render(<FileManager multipl={ this.props.multiple }
                                         current_folder={ config.current_folder }
                                         base_path={ config.base_path }
                                         csrf_token={ config.csrf_token }
                                         files_route={ config.files_route }
                                         onFilesSelect={ this.onSelect.bind(this) } />, this.root)
        }

        getMediaType = (path) => {
            const video = ['mp4', 'm4v', 'mov', 'wmv', 'avi', 'mpg', 'ogv', '3gp', '3g2']
            const audio = ['mp3', 'm4a', 'ogg', 'wav']
            const extension = path.split('.').slice(-1).pop()
            if (video.includes(extension)) {
                return 'video'
            } else if (audio.includes(extension)) {
                return 'audio'
            } else {
                return 'image'
            }
        }

        onSelect = (files) => {
            const { multiple, onSelect } = this.props

            const mediaItems = this.state.media
            let media = []

            if (multiple) {
                Object.keys(files).forEach((key) => {
                    const item = files[key]

                    mediaItems.push({
                        url: item.path,
                        type: this.getMediaType(item.type)
                    })
                })
            } else {
                media = {
                    url: files[0].path,
                    type: this.getMediaType(files[0].type)
                }
            }

            if (multiple) {
                this.setState({ media: mediaItems }, () => onSelect(this.state.media))
            } else {
                onSelect(media)
            }

            this.closeVM()
        }

        openModal = () => {
            let type = 'file'

            if (this.props.allowedTypes.length === 1 && this.props.allowedTypes[0] === 'image') {
                type = 'image'
            }

            this.openVM(type, this.onSelect)
        }

        openVM = (type, cb) => {
            $('#VoyagerFileManager .modal').modal('show')
        }

        closeVM () {
            $('#VoyagerFileManager .modal').modal('hide')
        }

        render () {
            const { render } = this.props
            return render({ open: this.openModal })
        }
    }

    hooks.addFilter(
        'editor.MediaUpload',
        'core/edit-post/components/media-upload/replace-media-upload',
        () => VoyagerFilemanager
    )
}
