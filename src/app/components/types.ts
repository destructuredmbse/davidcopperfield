export interface actor{
    id?:string
    first_name:string;
    last_name:string;
    available?:boolean
    child?:boolean
    photo?:any
    parent?:actor | undefined;
    plays?:character[];
    ensemble?:ensemble[];
    featured_in?:ensemble[];
    percentage?:number;
    availability?:rehearsal_day[];
}

export interface person{
    id?:string
    first_name: string,
    last_name?: string,
    _role?:string
}

export interface character{
    id?:string
    name:string;
    played_by:actor[]
}

export interface ensemble{
    id?:string
    name: string;
    members?: actor[]; // Array of actor objects
    available?:number,
    number?:number,
    featured?: actor[];
    
}

export interface section{
    id?:string
    colour:string;
    name:string;
    scenes:scene[];
    ensemble?:ensemble
}

export interface act{
    id?:string
    name: string;
    sections:section[];
}

export interface scene{
    id?:string
    name:string
    characters:character[]
    ensemble?:ensemble;
    next?:scene;
    previous?:scene;
    status?:string;
    pages:string;
    '@pages'?: string;
}

export interface rehearsal{
    id:string;
    times:string,
    _start_time:string,
    _end_time:string,
    _date:string,
    day:day
    _day:string,
    venues:location[],
    called:character[],
    scenes:scene[],
    ensemble:ensemble,
    creative?:person[],
    volunteers?:person[],
    aims?: string,
    notes?: string[]
    bsl_interpreter?: person,
    support?: person[],
    equipment?: equipment[],
    assistants?: person[],
    students?:person[]
}

export interface equipment{
    id?:string
    name: string,
    status: string,
    type: string
}

export interface location{
    id?:string
    name:string,
    address?:string;
    postcode?:string
}

export enum scene_status{
    unrehearsed,
    rehearsed,
    ready,
}

export interface day{
    id?:string,
    name?:string,
    day?:string,
    short?:string,
    _week?:number,
    _month?:number,
    _day?:number,
    _date:string
}

export interface time{
  name?: string,
  start_time: string,
  end_time: string
}

export interface rehearsal_day extends day{
    available?:actor[]
}

export interface user extends person {
    username?: string,
    email?:string,
    rba?:string[],
    is_admin?:boolean,
    first_logon?:boolean,
    creator?:person
  }