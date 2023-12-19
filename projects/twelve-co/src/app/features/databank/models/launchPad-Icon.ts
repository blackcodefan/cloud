export interface LaunchPadIcon{
    Name:string,
    IconUrl:string,
}

export interface LaunchPad{
    DesktopIcons: Array<LaunchPadIcon>,
    FooterIcons: Array<LaunchPadIcon>
}
