(function(exports) {
  // Validates a category hierarchy. The category hierarchy should be formatted as follows:
  // ["test", "test/test", "test/test/test", "test/test2", "test/test2/test3" ... ]
  exports.presets = {
    "NER": [
      "Person",
      "Organisation",
      "Location",
      "Miscellaneous"
    ],
    "Maintenance": [
      "Item",
      "Activity",
      "Location",
      "Time",
      "Attribute",
      "Cardinality",
      "Agent",
      "Consumable",
      "Observation",
      "Observation/Observed_state",
      "Observation/Quantitative",
      "Observation/Qualitative",
      "Specifier",
      "Event",
      "Unsure",
    ],
    "FIGER": [
      "person",
      "person/actor",
      "person/architect",
      "person/artist",
      "person/athlete",
      "person/author",
      "person/coach",
      "person/director",
      "person/doctor",
      "person/engineer",
      "person/monarch",
      "person/musician",
      "person/politician",
      "person/religious_leader",
      "person/soldier",
      "person/terrorist",
      "organization",
      "organization/airline",
      "organization/company",
      "organization/educational_institution",
      "organization/fraternity_sorority",
      "organization/sports_league",
      "organization/sports_team",
      "organization/terrorist_organisation",
      "organization/government_agency",
      "organization/government",
      "organization/political_party",
      "organization/educational_department",
      "organization/military",
      "organization/news_agency",
      "location",
      "location/city",
      "location/country",
      "location/county",
      "location/province",
      "location/railway",
      "location/road",
      "location/bridge",
      "location/body_of_water",
      "location/island",
      "location/mountain",
      "location/glacier",
      "location/astral_body",
      "location/cemetary",
      "location/park",
      "product",
      "product/engine",
      "product/airplane",
      "product/car",
      "product/ship",
      "product/spacecraft",
      "product/train",
      "product/camera",
      "product/mobile_phone",
      "product/computer",
      "product/software",
      "product/game",
      "product/instrument",
      "product/weapon",
      "art",
      "art/film",
      "art/play",
      "art/written_work",
      "art/newspaper",
      "art/music",
      "event",
      "event/attack",
      "event/election",
      "event/protest",
      "event/military_conflict",
      "event/natural_disaster",
      "event/sports_event",
      "event/terrorist_attack",
      "event/building",
      "event/airport",
      "event/dam",
      "event/hospital",
      "event/hotel",
      "event/library",
      "event/power_station",
      "event/restaurant",
      "event/sports_facility",
      "event/theater",
      "time",
      "color",
      "award",
      "educational_degree",
      "title",
      "law",
      "ethnicity",
      "language",
      "religion",
      "god",
      "chemical_thing",
      "biological_thing",
      "medical_treatment",
      "disease",
      "symptom",
      "drug",
      "body_part",
      "living_thing",
      "animal",
      "food",
      "website",
      "broadcast_network",
      "broadcast_program",
      "tv_channel",
      "currency",
      "stock_exchange",
      "algorithm",
      "programming_language",
      "transit_system",
      "transit_line"
    ],
    "Mining": [
      "accident_cause",
      "accident_cause/bodily_contact",
      "accident_cause/caught_between",
      "accident_cause/fall",
      "accident_cause/fall/fall_from_heights",
      "accident_cause/fall/fall_from_vehicle",
      "accident_cause/over_exertion",
      "accident_cause/recurrence",
      "accident_cause/stepping",
      "accident_cause/struck_by_object",
      "accident_cause/trip_and_fall",
      "accident_cause/vehicle_related",
      "activity",
      "activity/driving",
      "activity/running",
      "activity/walking",
      "age_group",
      "age_group/age_15_24",
      "age_group/age_25_34",
      "age_group/age_35_44",
      "age_group/age_45_54",
      "age_group/age_55_64",
      "age_group/age_65_100",
      "body_part",
      "body_part/arm",
      "body_part/arm/elbow",
      "body_part/arm/elbow/left_elbow",
      "body_part/arm/elbow/right_elbow",
      "body_part/arm/hand",
      "body_part/arm/hand/fingers",
      "body_part/arm/hand/left_hand",
      "body_part/arm/hand/right_hand",
      "body_part/arm/hand/thumb",
      "body_part/arm/hand/thumb/left_thumb",
      "body_part/arm/hand/thumb/right_thumb",
      "body_part/arm/left_arm",
      "body_part/arm/right_arm",
      "body_part/arm/shoulder",
      "body_part/arm/shoulder/left_shoulder",
      "body_part/arm/shoulder/right_shoulder",
      "body_part/arm/wrist",
      "body_part/arm/wrist/left_wrist",
      "body_part/arm/wrist/right_wrist",
      "body_part/back",
      "body_part/back/lower_back",
      "body_part/back/upper_back",
      "body_part/body",
      "body_part/body/chest",
      "body_part/body/stomach",
      "body_part/body/torso",
      "body_part/groin",
      "body_part/head",
      "body_part/head/ear",
      "body_part/head/ear/left_ear",
      "body_part/head/ear/right_ear",
      "body_part/head/eye",
      "body_part/head/eye/left_eye",
      "body_part/head/eye/right_eye",
      "body_part/head/mouth",
      "body_part/head/nose",
      "body_part/leg",
      "body_part/leg/ankle",
      "body_part/leg/ankle/left_ankle",
      "body_part/leg/ankle/right_ankle",
      "body_part/leg/calf",
      "body_part/leg/calf/left_calf",
      "body_part/leg/calf/right_calf",
      "body_part/leg/foot",
      "body_part/leg/foot/left_foot",
      "body_part/leg/foot/right_foot",
      "body_part/leg/foot/toes",
      "body_part/leg/knee",
      "body_part/leg/knee/left_knee",
      "body_part/leg/knee/right_knee",
      "body_part/leg/left_leg",
      "body_part/leg/right_leg",
      "body_part/leg/thigh",
      "body_part/leg/thigh/left_thigh",
      "body_part/leg/thigh/right_thigh",
      "body_part/neck",
      "equipment",
      "equipment/bund_wall",
      "equipment/cage",
      "equipment/cables",
      "equipment/catenery_cable",
      "equipment/chock",
      "equipment/chute",
      "equipment/filter",
      "equipment/headframe",
      "equipment/jumbo",
      "equipment/mechanical_equipment",
      "equipment/mechanical_equipment/auger",
      "equipment/mechanical_equipment/cavity_monitoring_system",
      "equipment/mechanical_equipment/conveyor",
      "equipment/mechanical_equipment/crusher",
      "equipment/mechanical_equipment/pump",
      "equipment/mechanical_equipment/pump/sump_pump",
      "equipment/mechanical_equipment/skip",
      "equipment/personal_protective_equipment",
      "equipment/pipe",
      "gender",
      "gender/female",
      "gender/male",
      "injury",
      "injury/amputation",
      "injury/bite",
      "injury/bruises",
      "injury/bruises/contusion",
      "injury/burn",
      "injury/burn/electric_burn",
      "injury/burn/thermal_burn",
      "injury/chemical_effect",
      "injury/crush_injury",
      "injury/dislocation",
      "injury/dislocation/displacement",
      "injury/fracture",
      "injury/fracture/break",
      "injury/laceration",
      "injury/loss_of_conciousness",
      "injury/multiple_injuries",
      "injury/muscle",
      "injury/muscle/sprain",
      "injury/muscle/strain",
      "injury/puncture",
      "injury/splinter",
      "injury/unspecified_injuries",
      "location",
      "location/camp_medical_centre",
      "location/kitchen",
      "location/office",
      "person",
      "person/blast_guard",
      "person/blaster",
      "person/boilermaker",
      "person/chef",
      "person/contractor",
      "person/driller",
      "person/driver",
      "person/electrical_worker",
      "person/employee",
      "person/fitter",
      "person/individual",
      "person/injured_person",
      "person/maintainer",
      "person/offsider",
      "person/operator",
      "person/personnel",
      "person/process_worker",
      "person/service_crew",
      "person/spotter",
      "person/supervisor",
      "person/telehandler",
      "person/underground_operator",
      "person/worker",
      "severity",
      "severity/minor",
      "severity/serious",
      "severity/fatal",
      "severity/ndi",
      "vehicle",
      "vehicle/light_vehicle",
      "vehicle/light_vehicle/car",
      "vehicle/light_vehicle/forklift",
      "vehicle/light_vehicle/man_car",
      "vehicle/light_vehicle/mine_car",
      "vehicle/light_vehicle/ute",
      "vehicle/light_vehicle/golf_buggy",
      "vehicle/heavy_vehicle",
      "vehicle/heavy_vehicle/bogger",
      "vehicle/heavy_vehicle/continuous_miner",
      "vehicle/heavy_vehicle/dozer",
      "vehicle/heavy_vehicle/dump_truck",
      "vehicle/heavy_vehicle/excavator",
      "vehicle/heavy_vehicle/haul_truck",
      "vehicle/heavy_vehicle/scraper",
      "vehicle/heavy_vehicle/grader",
      "unspecified_category"
    ],
  }

})(typeof exports === 'undefined' ? this['hierarchyPresets'] = {} : exports);