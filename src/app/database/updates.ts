 const start_of_rehearsal_update = `with uuid := <uuid>$param
insert default::rehearsal {
  aims := select scene filter
  day := to_str(.date, 'FMDay, FMDDth Month'),
  times := to_str(.start_time, 'FMHH:MIam') ++ <str>' - ' ++ to_str(.end_time, 'FMHH:MIam'),
  date,
  end_time,
  start_time,
  notes,
  outcome,
  venues: {
    adress,
    name,
    post_code
  },
  bsl_interpreter: {
    first_name,
    last_name
  },
  creative: {
    first_name
  },
  support: {
    first_name
  },
  volunteers: {
    first_name
  },
  scenes: {
    @pages,
    name,
    status,
    characters: {
      name,
      section: {
        colour,
        name
      }
    },
    ensemble: {
      name
    },
    section: {
      
    }
  },
  equipment: {
    name,
    status,
    type
  },
  assistants: {
    first_name
  },
  called: {
    name,
    played_by: {
      last_name,
      first_name
    }
  },
  students: {
    first_name
  },
  ensemble: {
    name,
    subensembles: {
      name
    }
  }
}
filter .id = <uuid>uuid`