export enum EmailDestinationEnum {
    FOLDER = 'FOLDER',
    TO = 'TO',
    CC = 'CC',
    BCC = 'BCC',
    SENDER = 'SENDER'
}

export enum EmailFilterFieldEnum {
    ALL = 'ALL',
    UNREAD = 'UNREAD',
    STARRED = 'STARRED',
    ATT = 'ATT',
    TO = 'TO',
    CC = 'CC',
    BCC = 'BCC'
}

export enum EmailSortFieldEnum {
    DATETIME = 'DATETIME',
    SIZE = 'SIZE',
    FROM = 'FROM',
    ATT = 'ATT'
}

export enum EmailSortDirEnum {
    ASC = 'ASC',
    DESC = 'DESC'
}
