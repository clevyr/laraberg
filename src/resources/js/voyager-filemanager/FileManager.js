/*
* Voyager File Manager
* */

/**
 * Modal Style.
 *
 * @type {{width: string}}
 */
const modalStyle = {
    width: '100%'
}

/**
 * Modal Dialog Style.
 *
 * @type {{transform: string, top: string, width: string, position: string}}
 */
const modalDialogStyle = {
    position: 'relative',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '75%'
}

/**
 * File Manager
 */
export default class FileManager extends React.Component {
    /**
     * Constructor
     *
     * @param props
     */
    constructor(props) {
        super(props);

        this.state = {
            files: [],
            selected_files: [],
            current_folder: this.props.current_folder,
        }
    }

    /**
     * Component Did Mount.
     */
    componentDidMount () {
        this.getFiles()
    }

    /**
     * Ger Files
     *
     * @return void
     */
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

    /**
     * Select Files.
     *
     * Sends the files to the parent component
     *
     * @param e
     */
    selectFiles (e) {
        e.preventDefault();

        this.props.onFilesSelect(this.state.selected_files)

        this.setState({ selected_files: [] })

        this.setState({ current_folder: '/' },
            () => this.getFiles())
    }

    /**
     * Select Folder.
     *
     * Selects a folder
     *
     * @param e
     * @param folder
     */
    selectFolder (e, folder) {
        e.preventDefault()

        let newFolder = '/'

        if (typeof folder === 'object') {
            newFolder = '/' + folder.relative_path
        } else {
            newFolder = folder
        }

        this.setState({ current_folder: newFolder },
            () => this.getFiles())
    }

    /**
     * Is Selected.
     *
     * Returns if the file is selected
     *
     * @param file
     * @returns {boolean}
     */
    isSelected (file) {
        return this.state.selected_files.includes(file)
    }

    /**
     * Set Selected.
     *
     * Sets or removes the file(s) as selected
     *
     * @param e
     * @param file
     */
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

    get currentPath () {
        return this.state.current_folder.split('/').filter((f) => {
            return f !== ''
        })
    }

    /**
     * Selected Count.
     *
     * Returns a count of selected files
     *
     * @returns {number}
     */
    get selectedCount () {
        return this.state.selected_files.length
    }

    render () {
        return (
            <section className="modal fade" tabIndex="-1" role="dialog" style={ modalStyle } key={this.props.files}>
                <div className="modal-dialog" role="document" style={ modalDialogStyle }>
                    <div className="modal-content">
                        <div className="modal-body filemanager">
                            <div id="toolbar">
                                <button className="btn btn-primary" onClick={ (e) => this.selectFiles(e) }>
                                    Select ({ this.selectedCount })
                                </button>
                            </div>
                            <div id="content">
                                <div className="breadcrumb-container">
                                    <div className="breadcrumb filemanager">
                                        <li className="media_breadcrumb" onClick={ (e) => this.selectFolder(e, '/') }>
                                            Home
                                            <span className="arrow"></span>
                                        </li>

                                        {this.currentPath.map((item) => {
                                            return <li key={ item } onClick={ (e) => this.selectFolder(e, item) }>
                                                { item }

                                                <span className="arrow"></span>
                                            </li>
                                        })}
                                    </div>
                                </div>

                                <ul id="files">
                                    {this.state.files.map((value, key) => {
                                        return <li key={key}
                                                   onClick={ value.type !== 'folder' ? (e) => this.setSelected(e, value) : (e) => e.preventDefault() }
                                                   onDoubleClick={ value.type === 'folder' ? (e) => this.selectFolder(e, value) : (e) => e.preventDefault() }>
                                            <div
                                                className={ 'file_link ' + (this.isSelected(value) ? 'selected' : '') }>
                                                <div className="link_icon">
                                                    {value.type === 'folder' &&
                                                        <i className="icon voyager-folder"></i>
                                                    }
                                                    {value.type.includes('image') &&
                                                        <div className="img_icon" style={{
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
                </div>
            </section>
        )
    }
}
