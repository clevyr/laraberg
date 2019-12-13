const modalStyle = {
    width: '100%'
}

const modalDialogStyle = {
    position: 'relative',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '75%'
}

export default class FileManager extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            files: [],
            selected_files: [],
            current_folder: this.props.current_folder,
        }
    }

    componentDidMount () {
        this.getFiles()
    }

    getFiles = () => {
        $.post(this.props.files_route, { folder: this.state.current_folder, _token: this.props.csrf_token }, (data) => {
            let files = []

            this.setState({ files: [] })

            for (let i = 0, file; file = data[i]; i++) {
                files.push(file);
            }

            this.setState({ files: files })

            this.setState({ selected_files: []})
        })
    }

    selectFiles (e) {
        e.preventDefault();

        this.props.onFilesSelect(this.state.selected_files)

        this.setState({ selected_files: [] })
    }

    selectFolder (e, folder) {
        e.preventDefault()

        this.setState({ current_folder: '/' + folder.name },
            () => this.getFiles())
    }


    isSelected (file) {
        return this.state.selected_files.includes(file)
    }

    setSelected (e, file) {
        e.preventDefault()

        const files = this.state.selected_files;

        if (files.indexOf(file) !== -1) {
            files.splice(files.indexOf(file), 1)
        } else {
            files.push(file)
        }

        this.setState({ selected_files: files });
    }

    get selectedCount () {
        return this.state.selected_files.length
    }

    render () {
        return (
            <section className="modal fade" tabIndex="-1" role="dialog" style={ modalStyle } key={this.props.files}>
                <div className="modal-dialog" role="document" style={ modalDialogStyle }>
                    <div className="modal-content">
                        <div className="modal-body file-manager">
                            <div id="toolbar">
                                <button className="btn btn-primary" onClick={ (e) => this.selectFiles(e) }>
                                    Select ({ this.selectedCount })
                                </button>
                            </div>
                            <ul id="files">
                                {this.state.files.map((value, key) => {
                                    return <li key={key}
                                               onClick={ value.type !== 'folder' ? (e) => this.setSelected(e, value) : (e) => e.preventDefault() }
                                               onDoubleClick={ value.type === 'folder' ? (e) => this.selectFolder(e, value) : (e) => e.preventDefault() }>
                                        <div className={ 'file_link ' + (this.isSelected(value) ? 'selected' : '') }>
                                            <div className="link_icon">
                                                {value.type === 'folder' &&
                                                    <i className="icon voyager-folder"></i>
                                                }
                                                {value.type.includes('image') &&
                                                    <div class="img_icon" style={{
                                                        'backgroundSize': 'contain',
                                                        'backgroundImage': 'url(' + value.path + ')',
                                                        'backgroundRepeat': 'no-repeat',
                                                        'backgroundPosition': 'center center',
                                                        'display': 'block',
                                                        'width': '100%',
                                                        'height': '100%'
                                                    }}></div>
                                                }
                                                {value.type !== 'folder' && !value.type.includes('image') &&
                                                    <i className="icon voyager-file-text"></i>
                                                }
                                            </div>

                                            <div className="details">
                                                <div className={ value.type }>
                                                    <h4>{ value.name }</h4>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}
