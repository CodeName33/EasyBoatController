HolesExt = 0.5;
LayerHeight = 0.1666;

ShaftDiameter = 8 + HolesExt;
ShaftLength = 600;

ShaftHolderFullDiameter = 27 + HolesExt;
ShaftHolderWallsDiameter = 26 + HolesExt; 
ShaftHolderSideDiameter = 12 + HolesExt;
ShaftHolderHeightMin = 4.5;
ShaftHolderHeightMax = 8.5;
ShaftHolderRingDiameter = 13 + HolesExt;
ShaftHolderRingHeightMax = 12;
ShaftHolderBoltDiameter = 5 + HolesExt;
ShaftHolderBoltOffset = 18;
ShaftHolderNutHoleDiameter = 9.2;
ShaftHolderNutHeight = 4.5;

TubeDiameter = 8 + HolesExt;
TubeLength = 600;

ShaftTubeSpace = 50;
ShaftTubeSpaceCentered = ShaftTubeSpace + TubeDiameter / 2 + ShaftDiameter / 2;

BackHeight = 30;
TubeHoldersThick = 4;
TubeHoldersClampSpace = 2;
TubeHoldersClampLength = 8;
TubeHoldersClampBoltDiameter = 4;
TubeHoldersClampBoltsCount = 2;

MovingPartHeight = 14;
MovingPartMinHeight = 3.5;
MovingPartMinDiameter = 10 + HolesExt;
MovingPartMaxDiameter = 22 + HolesExt;
MovingPartBoltsSpace = 16;
MovingPartBoltDiameter = 3;

FrontHeight = 30;
FrontAdvancedDiameter = 4;

MotorSize = 42;
MoterBoltsSpace = 31;
MoterBigRoundDiameter = 22 + HolesExt;
MoterBigRoundHeight = 2.5;
MotorAddLength = 8.5;
MotorLength = 40;
MotorPlugWidth = 16;
MotorPlugHeight = 10;
MotorBoltDiameter = 3;
MotorRotateDiameter = 5;
MotorRound = 4;
MotorBoxSize = MotorSize + 30;
MotorBoxCapThick = 3;
MotorBoxCapWallsHeight = 20;
MotorBoxCapBoltDiameter = 5;
MotorBoxCapBoltCapDiameter = 10; //Fix!!!
MotorBoxCapGasketThick = 0.5;

ClutchDiameter = 16; //Fix
ClutchLength = 25; // Fix
ClutchAddLength = 13; //Fix

BearDiameter = 15;
BearLength = 24;

NutDiameter = 7.2;
NutLength = 8;
NutRoundSize = 18;
NutRoundOffset = 2;
NutRoundTop = 1.8;

ESP32Length = 52;
ESP32Width = 29;
ESP32Height = 6;

MotorPlateWidth = 35;
MotorPlateLength = 42;
MotorPlateHeight = 22;
MotorPlatePlugWidth = 13;

MotorBoxAdvSpace = 10;

AdapterHeight = ClutchAddLength + MotorAddLength;

MiddleHeight = BearLength;
MiddlePlaceWidth = 60;
MiddlePlaceHeight = 10;
MiddlePlaceBoltsOffset = 6;
MiddlePlaceBoltDiameter = 5 + HolesExt;
MiddlePlaceNutDiameter = 9.2;
MiddlePlaceNutHeight = 4.5;

SlidingProfileSize = 10;
HelmHolderHeight = 70;
SlidingProfileHolderLength = 5;
SlidingProfileHolderSize = SlidingProfileSize;
SlidingProfileHolderNutLength = 4.5; //FIX!!!
SlidingProfileHolderNutSize = 8.2; //FIX!!!
SlidingProfileHolderBoltDiameter = 5 + HolesExt;

SlidingProfileLength = 140;

fn = 512;
over = 0.01;
DetailsSpace = 90;

PartsCount = 10;

RenderSingle = "";

BoardsCaseThick = 1.5;
BoardsCaseLength = 55;
BoardsCaseSections = [30, 15, 15];
BoardsCaseWidth = 50;

function asum(array, length) = [ for (a=0, b=array[0]; a < length + 1; a= a+1, b=b+(array[a]==undef?0:array[a])) b ];


//Boards case
if (len(RenderSingle) == 0 || len(search("d", RenderSingle)) > 0)
translate([DetailsSpace * 3, DetailsSpace * (PartsCount - 10), 0]) {
	rotate([90, 0, 0])
	for (i = [0 : len(BoardsCaseSections) - 1]) {
		Heights = asum(BoardsCaseSections, i);
		Height = Heights[len(Heights) - 1];
		
		Base = Height - BoardsCaseSections[i] + BoardsCaseThick * i;
		BaseHeight = BoardsCaseSections[i] + BoardsCaseThick;
		translate([0, 0, Base]) {
			difference() {
				cube([BoardsCaseWidth, BoardsCaseLength, BaseHeight + BoardsCaseThick]);
				translate([BoardsCaseThick, -over, BoardsCaseThick]) cube([BoardsCaseWidth - BoardsCaseThick * 2, BoardsCaseLength + over *2 , BaseHeight - BoardsCaseThick]);
			}
		}
		
	}
}

//Bolt Fixer RotateCase
if (len(RenderSingle) == 0 || len(search("c", RenderSingle)) > 0)
translate([-DetailsSpace * 2, DetailsSpace * (PartsCount - 10), 0]) {
	BoltCaseHeight = 44;
	BoltDiameter = 5.4;
	BoltCaseThick = 2;
	BoltCaseCapSizeMax = 30;
	BoltCaseCapSizeMin = 12;
	BoltCaseCapHeight = 17;
	BoltCapHeight = 3;
	BoltCapDiameter = 9.5;
	BoltCaseTiameter = BoltDiameter + BoltCaseThick * 2;
	
	difference() {
		union() {
			resize([BoltCaseCapSizeMax, BoltCaseCapSizeMin, BoltCaseCapHeight]) {
				cylinder(h = BoltCaseCapHeight - BoltCaseCapSizeMin, d = BoltCaseCapSizeMax, $fn = 1024);
				translate([0, 0, BoltCaseCapHeight - BoltCaseCapSizeMin]) difference() {
					sphere(d = BoltCaseCapSizeMax, $fn = 512);
					rotate([180, 0, 0]) cylinder(h = BoltCaseCapSizeMax / 2, d = BoltCaseCapSizeMax, $fn = 1024);
				}
			}
			translate([0, 0, 0]) cylinder(h = BoltCaseHeight - BoltCaseTiameter / 2, d = BoltCaseTiameter, $fn = 1024);
			translate([0, 0, BoltCaseHeight - BoltCaseTiameter / 2]) sphere(d = BoltCaseTiameter, $fn = 512);
		}
		translate([0, 0, -0.01]) cylinder(h = BoltCaseHeight + 0.2, d = BoltDiameter, $fn = 1024);
		cube([BoltCapDiameter, BoltDiameter, BoltCapHeight * 2], center = true);
		cube([BoltDiameter, BoltDiameter, BoltCapHeight * 2 + LayerHeight * 4], center = true);
	}
}

//Slider Holder
if (len(RenderSingle) == 0 || len(search("b", RenderSingle)) > 0)
translate([-DetailsSpace, DetailsSpace * (PartsCount - 10), 0]) {
	cube([SlidingProfileHolderSize - HolesExt, SlidingProfileHolderSize - HolesExt, SlidingProfileHolderLength - 1 + over]);
}

//MotorBoxCap
if (len(RenderSingle) == 0 || len(search("a", RenderSingle)) > 0)
translate([0, DetailsSpace * (PartsCount - 10), 0]) {
	difference() {
		cuberounded([MotorBoxSize + TubeHoldersThick * 2 + MotorBoxCapThick * 2 + HolesExt, MotorBoxSize + TubeHoldersThick * 2 + MotorBoxCapThick * 2 + HolesExt, MotorBoxCapThick + MotorBoxCapWallsHeight], [1,2,3,4], radius = MotorRound, fn = fn);
		translate([MotorBoxCapThick + HolesExt / 2, MotorBoxCapThick + HolesExt / 2, MotorBoxCapThick - MotorBoxCapGasketThick]) cuberounded([MotorBoxSize + TubeHoldersThick * 2 + HolesExt, MotorBoxSize + TubeHoldersThick * 2 + HolesExt, MotorBoxCapWallsHeight + MotorBoxCapGasketThick + over], [1,2,3,4], radius = MotorRound, fn = fn);
		
		translate([(MotorBoxSize + TubeHoldersThick * 2 + MotorBoxCapThick * 2 + HolesExt) / 2, (MotorBoxSize + TubeHoldersThick * 2 + MotorBoxCapThick * 2 + HolesExt) / 2, MotorBoxCapThick + MotorBoxCapWallsHeight / 2]) 
		for (i = [0, 1]) {
			mirror([0, i, 0])
			translate([0, -(MotorBoxSize + TubeHoldersThick * 2 + MotorBoxCapThick * 2 + HolesExt) / 2 - over, 0])
				rotate([-90,0,0]) {
					cylinder(h = MotorBoxCapThick * 2, d = MotorBoxCapBoltDiameter, $fn = 128);
					cylinder(h = 1, d = MotorBoxCapBoltCapDiameter, $fn = 128);
					translate([0, 0, 1 - over]) cylinder(h = 1, d1 = MotorBoxCapBoltCapDiameter, d2 = MotorBoxCapBoltDiameter, $fn = 128);
			}
		}
	}
	//gasket
	translate([MotorBoxSize * 2, 0, 0]) cuberounded([MotorBoxSize + TubeHoldersThick * 2, MotorBoxSize + TubeHoldersThick * 2, MotorBoxCapGasketThick], [1,2,3,4], radius = MotorRound, fn = fn);
}

//Sliding Profile
if (len(RenderSingle) == 0 || len(search("9", RenderSingle)) > 0)
translate([0, DetailsSpace * (PartsCount - 9), 0]) {
	translate([0, SlidingProfileSize * 2, 0]) rotate([90, 0, 0]) difference() {
		union() {
			cube([SlidingProfileLength, SlidingProfileSize - HolesExt / 2, SlidingProfileSize - HolesExt / 2]);
			translate([SlidingProfileLength, 0, -TubeHoldersThick]) cube([TubeHoldersThick, SlidingProfileSize - HolesExt / 2, SlidingProfileSize - HolesExt / 2 + TubeHoldersThick * 2]);
		}
		translate([ MiddleHeight / 2, - over,  SlidingProfileHolderSize / 2 + HolesExt / 4]) {
			rotate([-90, 0, 0])
			cylinder(h = SlidingProfileHolderSize + over * 2, d = SlidingProfileHolderBoltDiameter, $fn = 128);
		}
	}
}

//Rubber Part
if (len(RenderSingle) == 0 || len(search("8", RenderSingle)) > 0)
translate([0, DetailsSpace * (PartsCount - 8), 0]) {
	for (i = [ 0, 1 ]) {
		mirror([i, 0, 0])
		{
			translate([10, -HelmHolderHeight / 2, 0]) {
				hull() {
					cube([SlidingProfileSize + TubeHoldersThick * 2, HelmHolderHeight, 0.01]);
					translate([SlidingProfileSize /2 + TubeHoldersThick, 0, 10]) rotate([-88.5, 0, 0]) scale ([1,0.6,1]) difference() { 
						cylinder(h = HelmHolderHeight, d =  TubeHoldersThick / 2, $fn = fn);
						translate([-(SlidingProfileSize + TubeHoldersThick * 2) / 2, 0, -over]) cube([SlidingProfileSize + TubeHoldersThick * 2,SlidingProfileSize + TubeHoldersThick * 2,HelmHolderHeight + over * 2]);
					}
				}
			}
		}
	}
}

//Middle Top Sliding Part
if (len(RenderSingle) == 0 || len(search("7", RenderSingle)) > 0)
translate([0, DetailsSpace * (PartsCount - 7), 0]) {

	difference() {
		union() {
			translate([0, -MiddleHeight / 2, TubeHoldersThick]) {
				difference() {
					cube([SlidingProfileSize + TubeHoldersThick* 2,  MiddleHeight, SlidingProfileSize + TubeHoldersThick* 2]);
					translate([TubeHoldersThick, -over, TubeHoldersThick]) cube([SlidingProfileSize,  MiddleHeight + over * 2, SlidingProfileSize]);
				}
			}
			translate([0, -MiddleHeight / 2, TubeHoldersThick * 2 + SlidingProfileSize]) {
				cube([SlidingProfileSize + TubeHoldersThick* 2,  MiddleHeight, HelmHolderHeight]);
			}

		}

		
		translate([ - over, 0, TubeHoldersThick * 2 + (SlidingProfileSize - SlidingProfileHolderSize) / 2 + SlidingProfileHolderSize / 2]) {
			rotate([0, 90, 0])
			cylinder(h = SlidingProfileSize + TubeHoldersThick * 2 + over * 2, d = SlidingProfileHolderBoltDiameter, $fn = 128);
		}
	}
}

//Middle Top Part
if (len(RenderSingle) == 0 || len(search("6", RenderSingle)) > 0)
translate([0, DetailsSpace * (PartsCount - 6), 0]) {
	difference() {
		translate([-MiddlePlaceWidth / 2, -MiddleHeight / 2, 0]) {
			cuberounded([MiddlePlaceWidth, MiddleHeight, TubeHoldersThick + 0.01], ["u2", "u4"], fn = 128);
		}
		for (i = [ 0, 1 ]) {
			mirror([i, 0, 0])
			for (j = [0, 1]) {
				mirror([0,j,0])
				translate([MiddlePlaceWidth / 2 - MiddlePlaceBoltsOffset, MiddleHeight / 2 - MiddlePlaceBoltsOffset, -over]) {
					cylinder(h = TubeHoldersThick + over * 3, d = MiddlePlaceBoltDiameter, $fn = 128);
				}
			}
		}
	}
	difference() {
		union() {
			translate([0, -MiddleHeight / 2, TubeHoldersThick]) {
				difference() {
					cube([SlidingProfileSize + TubeHoldersThick* 2,  MiddleHeight, SlidingProfileSize + TubeHoldersThick* 2]);
					translate([TubeHoldersThick, -over, TubeHoldersThick]) cube([SlidingProfileSize,  MiddleHeight + over * 2, SlidingProfileSize]);
				}
			}
			translate([0, -MiddleHeight / 2, TubeHoldersThick * 2 + SlidingProfileSize]) {
				cube([SlidingProfileSize + TubeHoldersThick* 2,  MiddleHeight, HelmHolderHeight]);
			}
			width = (SlidingProfileHolderNutLength + SlidingProfileHolderLength + TubeHoldersThick);
			translate([-width, -MiddleHeight / 2, TubeHoldersThick]) {
				cube([width, MiddleHeight, SlidingProfileHolderSize + TubeHoldersThick * 2]);
			}
		}
		translate([TubeHoldersThick - SlidingProfileHolderLength, -SlidingProfileHolderSize / 2, TubeHoldersThick * 2 + (SlidingProfileSize - SlidingProfileHolderSize) / 2]) {
			cube([SlidingProfileHolderLength + over, SlidingProfileHolderSize, SlidingProfileHolderSize]);
		}
		
		translate([-(SlidingProfileHolderNutLength + SlidingProfileHolderLength + TubeHoldersThick) - over, 0, TubeHoldersThick * 2 + (SlidingProfileSize - SlidingProfileHolderSize) / 2 + SlidingProfileHolderSize / 2]) {
			rotate([0, 90, 0])
			cylinder(h = SlidingProfileHolderNutLength + SlidingProfileHolderLength + TubeHoldersThick + over, d = SlidingProfileHolderBoltDiameter, $fn = 128);
		}
		translate([-(SlidingProfileHolderNutLength + SlidingProfileHolderLength), -MiddleHeight / 2 + TubeHoldersThick, TubeHoldersThick * 2 + (SlidingProfileSize - SlidingProfileHolderNutSize) / 2]) {
			cube([SlidingProfileHolderNutLength,MiddleHeight - TubeHoldersThick + over,SlidingProfileHolderNutSize]);
		}
	}
}

//Middle Part
if (len(RenderSingle) == 0 || len(search("5", RenderSingle)) > 0)
translate([0, DetailsSpace * (PartsCount - 5), 0])
for (i = [ 0, 1 ]) {
	mirror([i, 0, 0])
	{
		translate([ShaftTubeSpaceCentered, 0, 0]) {
			difference() {
				union() {
					hull() {
						cylinder(h = MiddleHeight, d = BearDiameter + TubeHoldersThick * 2, $fn = fn);
						translate([-ShaftTubeSpaceCentered, 0, 0]) {
							//cylinder(h = MiddleHeight, d = ShaftHolderFullDiameter + TubeHoldersThick * 2, $fn = fn); //Shaft
							cylinder(h = MiddleHeight, d = ShaftHolderFullDiameter + FrontAdvancedDiameter + TubeHoldersThick * 2, $fn = fn); //Shaft
						}
					}
					translate([-ShaftTubeSpaceCentered, ShaftHolderFullDiameter / 2, 0]) {
						cube([MiddlePlaceWidth / 2, MiddlePlaceHeight, MiddleHeight]);
					}
					for (j = [0, 1]) {
						mirror([0, j, 0]) {
							difference() { //Clamps
								union() {
									translate([BearDiameter / 2 , TubeHoldersClampSpace / 2, 0]) {
										cube([TubeHoldersThick + TubeHoldersClampLength - TubeHoldersThick / 2, TubeHoldersThick, MiddleHeight + over * 2]);
									}
									translate([BearDiameter / 2 + TubeHoldersThick + TubeHoldersClampLength - TubeHoldersThick / 2, TubeHoldersClampSpace / 2 + TubeHoldersThick / 2, 0]) {
										cylinder(h = MiddleHeight, d = TubeHoldersThick, $fn = fn);
									}
								}
								space = MiddleHeight / TubeHoldersClampBoltsCount;
								for (k = [ 0 : TubeHoldersClampBoltsCount - 1 ]) {
									translate([BearDiameter / 2 + TubeHoldersThick + TubeHoldersClampLength / 2 - TubeHoldersThick / 2, TubeHoldersClampSpace / 2 + TubeHoldersThick + over, space / 2 + space * k]) {
										rotate([90, 0, 0]) {
											cylinder(h = TubeHoldersThick + over * 2, d = TubeHoldersClampBoltDiameter, $fn = fn);
										}
									}
								}
							}
						}
					}
				}
				translate([-ShaftTubeSpaceCentered, ShaftHolderFullDiameter / 2 + MiddlePlaceHeight, MiddleHeight / 2]) {
					rotate([90, 0, 0]) {
						for (j = [0, 1]) {
							mirror([0,j,0])
							translate([MiddlePlaceWidth / 2 - MiddlePlaceBoltsOffset, MiddleHeight / 2 - MiddlePlaceBoltsOffset, -over]) {
								cylinder(h = ShaftHolderFullDiameter + MiddlePlaceHeight + TubeHoldersThick * 2, d = MiddlePlaceBoltDiameter, $fn = 128);
								
								translate([0, 0, ShaftHolderFullDiameter + MiddlePlaceHeight]) {
									cylinder(h = MiddlePlaceNutHeight * 2 + over, d = MiddlePlaceNutDiameter, $fn = 6);
								}
							}
						}
					}
				}
				translate([0, 0, -over]) cylinder(h = MiddleHeight + over * 2, d = BearDiameter, $fn = fn);
				translate([BearDiameter / 2 + TubeHoldersThick / 2, 0, MiddleHeight / 2]) {
					cube([TubeHoldersThick * 2, TubeHoldersClampSpace, MiddleHeight + over * 2], center = true);
				}
				translate([-ShaftTubeSpaceCentered, 0, -over]) {
					cylinder(h = MiddleHeight + over * 2, d = ShaftDiameter + 1 * 2, $fn = fn);
					
					MovingPartBoltsSpaceC =sqrt((MovingPartBoltsSpace * MovingPartBoltsSpace) / 2);
					for (j = [0, 1]) {
						mirror([0, j, 0])
						translate([MovingPartBoltsSpaceC / 2, MovingPartBoltsSpaceC / 2, 0]) { //Bolts + Nuts
							cylinder(h = MiddleHeight + over * 2, d = MovingPartBoltDiameter, $fn = fn);
							//cylinder(h = ShaftHolderNutHeight + over, d = ShaftHolderNutHoleDiameter, $fn = 6);
							//translate([0, 0, ShaftHolderNutHeight + over]) cube([ShaftHolderNutHoleDiameter / 1.7, ShaftHolderNutHoleDiameter, 0.2 * 2], center = true);
							//translate([0, 0, ShaftHolderNutHeight + over + 0.2]) cube([ShaftHolderNutHoleDiameter, ShaftHolderNutHoleDiameter / 1.7, 0.2 * 2], center = true);
						}
					}
					
					translate([0, 0, MiddleHeight - MovingPartMinHeight + over]) {
						cylinder(h = MovingPartMinHeight + over, d = MovingPartMaxDiameter, $fn = fn);
					}
					translate([0, 0, MiddleHeight - MovingPartHeight + over]) {
						cylinder(h = MovingPartHeight + over, d = MovingPartMinDiameter, $fn = fn);
					}
					/*
					translate([0, 0, MiddleHeight - ShaftHolderHeightMin + over]) {
						hull() {
							cylinder(h = ShaftHolderHeightMin + over, d = ShaftHolderFullDiameter, $fn = fn);
							translate([ShaftHolderBoltOffset, 0, 0]) cylinder(h = ShaftHolderHeightMin + over, d = ShaftHolderSideDiameter, $fn = fn);
						}
					}
					*/
					
				}
				translate([-ShaftTubeSpaceCentered, 0, 0]) {
					translate([0, (ShaftHolderFullDiameter + FrontAdvancedDiameter) / 2 + TubeHoldersThick, MiddleHeight / 2]) {
						rotate([90, 0, 0]) cylinder(h = NutLength, d = NutDiameter, $fn = 64);
					}
				}
				cubeSize = (ShaftHolderFullDiameter + TubeHoldersThick * 2);
				translate([-ShaftTubeSpaceCentered - cubeSize, -cubeSize, -over]) cube([cubeSize, cubeSize * 2, MiddleHeight + over * 2]);
				
			}
		}
	}
}

//Motor Box
if (len(RenderSingle) == 0 || len(search("4", RenderSingle)) > 0)
translate([0, DetailsSpace * (PartsCount - 4), 0])
translate([-MotorBoxSize / 2 - TubeHoldersThick, - MotorBoxSize /2 - TubeHoldersThick, 0]) {
	difference() {
		MotorBoxHeight = MotorLength + ESP32Length + MotorBoxAdvSpace + TubeHoldersThick;
		cuberounded([MotorBoxSize + TubeHoldersThick * 2, MotorBoxSize + TubeHoldersThick * 2, MotorBoxHeight], [1,2,3,4], radius = MotorRound, fn = fn);
		translate([TubeHoldersThick, TubeHoldersThick, TubeHoldersThick]) cuberounded([MotorBoxSize, MotorBoxSize, MotorLength + ESP32Length + MotorBoxAdvSpace + over], [1,2,3,4],radius = MotorRound / 2, fn = fn);
		translate([MotorBoxSize / 2 + TubeHoldersThick, MotorBoxSize /2 + TubeHoldersThick, 0])
		for (i = [0, 90, 180, 270]) {
			rotate([0, 0, i])
			translate([MoterBoltsSpace / 2, MoterBoltsSpace / 2, -over]) cylinder(h = TubeHoldersThick + over * 2, d = MotorBoltDiameter, $fn = fn);
		}
		
		translate([MotorBoxSize / 2 + TubeHoldersThick, MotorBoxSize /2 + TubeHoldersThick, TubeHoldersThick - MoterBigRoundHeight]) {
			cylinder(h = MoterBigRoundHeight + over, d = MoterBigRoundDiameter, $fn = fn);
		}
		
		translate([MotorBoxSize / 2 + TubeHoldersThick, MotorBoxSize /2 + TubeHoldersThick, -over]) {
			cylinder(h = TubeHoldersThick + over, d = MotorRotateDiameter + 1 * 2, $fn = fn);
		}
		translate([(MotorBoxSize + TubeHoldersThick * 2) / 2, -over, MotorBoxHeight - MotorBoxCapWallsHeight / 2]) {
			rotate([-90,0, 0]) cylinder(h = MotorBoxSize + TubeHoldersThick * 2 + over * 2, d = MotorBoxCapBoltDiameter, $fn = 128);
		}
		//MotorBoxCapWallsHeight
		
	}
	
	
	
}


//Adapter
if (len(RenderSingle) == 0 || len(search("3", RenderSingle)) > 0)
translate([0, DetailsSpace * (PartsCount - 3), 0])
for (i = [ 0, 1 ]) {
	mirror([i, 0, 0])
	{
		translate([ShaftTubeSpaceCentered, 0, 0]) {
			difference() {
				union() {
					hull() {
						translate([-ShaftTubeSpaceCentered, 0, 0]) {
							//cylinder(h = AdapterHeight, d = TubeDiameter + TubeHoldersThick * 2, $fn = fn);
							translate([ShaftHolderBoltOffset, 0, 0]) cylinder(h = AdapterHeight, d = ShaftHolderSideDiameter + TubeHoldersThick * 2, $fn = fn);
							//cylinder(h = AdapterHeight, d = ShaftHolderFullDiameter + TubeHoldersThick * 2, $fn = fn); //Shaft
							cylinder(h = AdapterHeight, d = ShaftHolderFullDiameter + TubeHoldersThick * 2, $fn = fn); //Shaft
						}
					}
					for (j = [0, 1]) {
						mirror([0, j, 0])
						translate([-ShaftTubeSpaceCentered, 0, 0]) {
							difference() {
								cuberounded([MotorBoxSize / 2 + TubeHoldersThick, MotorBoxSize / 2 + TubeHoldersThick, TubeHoldersThick], [3], radius = MotorRound, fn = fn);
								translate([MoterBoltsSpace / 2, MoterBoltsSpace / 2, -over]) cylinder(h = TubeHoldersThick + over * 2, d = MotorBoltDiameter, $fn = fn);
							}
						}
					}
				}
				
				translate([-ShaftTubeSpaceCentered, 0, -over]) {
					cylinder(h = AdapterHeight + over * 2, d = ClutchDiameter + 2 * 2, $fn = fn);
					translate([ShaftHolderBoltOffset, 0, 0]) { //Bolts + Nuts
						cylinder(h = AdapterHeight + over * 2, d = ShaftHolderBoltDiameter, $fn = fn);
						cylinder(h = ShaftHolderNutHeight + over, d = ShaftHolderNutHoleDiameter, $fn = 6);
						translate([0, 0, ShaftHolderNutHeight + over]) cube([ShaftHolderNutHoleDiameter / 1.7, ShaftHolderNutHoleDiameter, 0.2 * 2], center = true);
						translate([0, 0, ShaftHolderNutHeight + over + 0.2]) cube([ShaftHolderNutHoleDiameter, ShaftHolderNutHoleDiameter / 1.7, 0.2 * 2], center = true);
					}
				}

				cubeSize = (ShaftHolderFullDiameter + TubeHoldersThick * 2);
				translate([-ShaftTubeSpaceCentered - cubeSize, -cubeSize, -over]) cube([cubeSize, cubeSize * 2, AdapterHeight + over * 2]);
				
			}
		}
	}
}

//FrontPart
if (len(RenderSingle) == 0 || len(search("2", RenderSingle)) > 0)
translate([0, DetailsSpace * (PartsCount - 2), 0])
for (i = [ 0, 1 ]) {
	mirror([i, 0, 0])
	{
		translate([ShaftTubeSpaceCentered, 0, 0]) {
			difference() {
				union() {
					hull() {
						cylinder(h = FrontHeight, d = TubeDiameter + TubeHoldersThick * 2, $fn = fn);
						translate([-ShaftTubeSpaceCentered, 0, 0]) {
							//cylinder(h = FrontHeight, d = ShaftHolderFullDiameter + TubeHoldersThick * 2, $fn = fn); //Shaft
							cylinder(h = FrontHeight, d = ShaftHolderFullDiameter + FrontAdvancedDiameter + TubeHoldersThick * 2, $fn = fn); //Shaft
						}
					}
					for (j = [0, 1]) {
						mirror([0, j, 0]) {
							difference() { //Clamps
								union() {
									translate([TubeDiameter / 2 , TubeHoldersClampSpace / 2, 0]) {
										cube([TubeHoldersThick + TubeHoldersClampLength - TubeHoldersThick / 2, TubeHoldersThick, FrontHeight + over * 2]);
									}
									translate([TubeDiameter / 2 + TubeHoldersThick + TubeHoldersClampLength - TubeHoldersThick / 2, TubeHoldersClampSpace / 2 + TubeHoldersThick / 2, 0]) {
										cylinder(h = FrontHeight, d = TubeHoldersThick, $fn = fn);
									}
								}
								space = FrontHeight / TubeHoldersClampBoltsCount;
								for (k = [ 0 : TubeHoldersClampBoltsCount - 1 ]) {
									translate([TubeDiameter / 2 + TubeHoldersThick + TubeHoldersClampLength / 2 - TubeHoldersThick / 2, TubeHoldersClampSpace / 2 + TubeHoldersThick + over, space / 2 + space * k]) {
										rotate([90, 0, 0]) {
											cylinder(h = TubeHoldersThick + over * 2, d = TubeHoldersClampBoltDiameter, $fn = fn);
										}
									}
								}
							}
						}
					}
				}
				translate([0, 0, -over]) cylinder(h = FrontHeight + over * 2, d = TubeDiameter, $fn = fn);
				translate([TubeDiameter / 2 + TubeHoldersThick / 2, 0, FrontHeight / 2]) {
					cube([TubeHoldersThick * 2, TubeHoldersClampSpace, FrontHeight + over * 2], center = true);
				}
				translate([-ShaftTubeSpaceCentered, 0, -over]) {
					cylinder(h = FrontHeight + over * 2, d = ClutchDiameter + 2 * 2, $fn = fn);
					translate([ShaftHolderBoltOffset, 0, 0]) { //Bolts + Nuts
						cylinder(h = FrontHeight + over * 2, d = ShaftHolderBoltDiameter, $fn = fn);
						//cylinder(h = ShaftHolderNutHeight + over, d = ShaftHolderNutHoleDiameter, $fn = 6);
						//translate([0, 0, ShaftHolderNutHeight + over]) cube([ShaftHolderNutHoleDiameter / 1.7, ShaftHolderNutHoleDiameter, 0.2 * 2], center = true);
						//translate([0, 0, ShaftHolderNutHeight + over + 0.2]) cube([ShaftHolderNutHoleDiameter, ShaftHolderNutHoleDiameter / 1.7, 0.2 * 2], center = true);
					}
					
					translate([0, 0, FrontHeight - ShaftHolderHeightMin + over]) {
						hull() {
							cylinder(h = ShaftHolderHeightMin + over, d = ShaftHolderFullDiameter, $fn = fn);
							translate([ShaftHolderBoltOffset, 0, 0]) cylinder(h = ShaftHolderHeightMin + over, d = ShaftHolderSideDiameter, $fn = fn);
						}
					}
					
				}
				translate([-ShaftTubeSpaceCentered, 0, 0]) {
					translate([0, (ShaftHolderFullDiameter + FrontAdvancedDiameter) / 2 + TubeHoldersThick, FrontHeight / 2]) {
						rotate([90, 0, 0]) cylinder(h = NutLength, d = NutDiameter, $fn = 64);
					}
				}
				cubeSize = (ShaftHolderFullDiameter + TubeHoldersThick * 2);
				translate([-ShaftTubeSpaceCentered - cubeSize, -cubeSize, -over]) cube([cubeSize, cubeSize * 2, FrontHeight + over * 2]);
				
			}
		}
	}
}


//BackPart
if (len(RenderSingle) == 0 || len(search("1", RenderSingle)) > 0)
translate([0, DetailsSpace * (PartsCount - 1), 0])
for (i = [ 0, 1 ]) {
	mirror([i, 0, 0]) {
		translate([ShaftTubeSpaceCentered, 0, 0]) {
			difference() {
				union() {
					hull() {
						cylinder(h = BackHeight, d = TubeDiameter + TubeHoldersThick * 2, $fn = fn);
						translate([-ShaftTubeSpaceCentered, 0, 0]) {
							cylinder(h = BackHeight, d = ShaftHolderFullDiameter + TubeHoldersThick * 2, $fn = fn); //Shaft
						}
					}
					for (j = [0, 1]) {
						mirror([0, j, 0]) {
							difference() { //Clamps
								union() {
									translate([TubeDiameter / 2 , TubeHoldersClampSpace / 2, 0]) {
										cube([TubeHoldersThick + TubeHoldersClampLength - TubeHoldersThick / 2, TubeHoldersThick, BackHeight + over * 2]);
									}
									translate([TubeDiameter / 2 + TubeHoldersThick + TubeHoldersClampLength - TubeHoldersThick / 2, TubeHoldersClampSpace / 2 + TubeHoldersThick / 2, 0]) {
										cylinder(h = BackHeight, d = TubeHoldersThick, $fn = fn);
									}
								}
								space = BackHeight / TubeHoldersClampBoltsCount;
								for (k = [ 0 : TubeHoldersClampBoltsCount - 1 ]) {
									translate([TubeDiameter / 2 + TubeHoldersThick + TubeHoldersClampLength / 2 - TubeHoldersThick / 2, TubeHoldersClampSpace / 2 + TubeHoldersThick + over, space / 2 + space * k]) {
										rotate([90, 0, 0]) {
											cylinder(h = TubeHoldersThick + over * 2, d = TubeHoldersClampBoltDiameter, $fn = fn);
										}
									}
								}
							}
						}
					}
				}
				translate([0, 0, -over]) cylinder(h = BackHeight + over * 2, d = TubeDiameter, $fn = fn);
				translate([TubeDiameter / 2 + TubeHoldersThick / 2, 0, BackHeight / 2]) {
					cube([TubeHoldersThick * 2, TubeHoldersClampSpace,BackHeight + over * 2], center = true);
				}
				translate([-ShaftTubeSpaceCentered, 0, -over]) {
					cylinder(h = BackHeight + over * 2, d = ShaftDiameter + 1 * 2, $fn = fn);
					translate([ShaftHolderBoltOffset, 0, 0]) { //Bolts + Nuts
						cylinder(h = BackHeight + over * 2, d = ShaftHolderBoltDiameter, $fn = fn);
						cylinder(h = ShaftHolderNutHeight + over, d = ShaftHolderNutHoleDiameter, $fn = 6);
						translate([0, 0, ShaftHolderNutHeight + over]) cube([ShaftHolderNutHoleDiameter / 1.7, ShaftHolderNutHoleDiameter, 0.2 * 2], center = true);
						translate([0, 0, ShaftHolderNutHeight + over + 0.2]) cube([ShaftHolderNutHoleDiameter, ShaftHolderNutHoleDiameter / 1.7, 0.2 * 2], center = true);
					}
					translate([0, 0, BackHeight - ShaftHolderHeightMax + over]) {
						cylinder(h = ShaftHolderHeightMax + over, d = ShaftHolderWallsDiameter, $fn = fn);
					}
					translate([0, 0, BackHeight - ShaftHolderRingHeightMax + over]) {
						cylinder(h = ShaftHolderRingHeightMax + over, d = ShaftHolderRingDiameter, $fn = fn);
					}
					
					
					translate([0, 0, BackHeight - ShaftHolderHeightMin + over]) {
						hull() {
							cylinder(h = ShaftHolderHeightMin + over, d = ShaftHolderFullDiameter, $fn = fn);
							translate([ShaftHolderBoltOffset, 0, 0]) cylinder(h = ShaftHolderHeightMin + over, d = ShaftHolderSideDiameter, $fn = fn);
						}
					}
				}
				translate([-ShaftTubeSpaceCentered, 0, 0]) {
					translate([0, ShaftHolderFullDiameter / 2 + TubeHoldersThick, BackHeight / 2]) {
						rotate([90, 0, 0]) cylinder(h = NutLength, d = NutDiameter, $fn = 64);
					}
				}
				cubeSize = (ShaftHolderFullDiameter + TubeHoldersThick * 2);
				translate([-ShaftTubeSpaceCentered - cubeSize, -cubeSize, -over]) cube([cubeSize, cubeSize * 2, BackHeight + over * 2]);
				
			}
		}
	}
}










module _create_round_corner(length, radius, fn) {
	difference() {
		cube([ radius * 2, radius * 2, length + 0.02 ]);
		cylinder(h = length + 0.02, r1 = radius, r2 = radius, $fn = fn);
	}
}

module roundcorner(cube_size, corner_strings_array, radius = 2, fn = 16) {
	xsize = cube_size[0];
	ysize = cube_size[1];
	zsize = cube_size[2];
	
	for (i = [0:len(corner_strings_array) - 1])
	{
		corner_string = str(corner_strings_array[i]);
		if (corner_string == "t1" || corner_string == "u1") {
			translate([xsize + 0.01, radius, zsize - radius]) rotate([90, 0, 270]) _create_round_corner(xsize, radius, fn);
		} else if (corner_string == "t2" || corner_string == "u2") {
			translate([xsize - radius, ysize + 0.01, zsize - radius]) rotate([90, 0, 0]) _create_round_corner(ysize, radius, fn);
		} else if (corner_string == "t3" || corner_string == "u3") {
			translate([-0.01, ysize - radius, zsize - radius]) rotate([90, 0, 90]) _create_round_corner(xsize, radius, fn);
		} else if (corner_string == "t4" || corner_string == "u4") {
			translate([radius, -0.01, zsize - radius]) rotate([90, 0, 180]) _create_round_corner(ysize, radius, fn);
		} else if (corner_string == "b1" || corner_string == "d1") {
			translate([-0.01, radius, radius]) rotate([270, 0, 270]) _create_round_corner(xsize, radius, fn);
		} else if (corner_string == "b2" || corner_string == "d2") {
			translate([xsize - radius, ysize + 0.01, radius]) rotate([0, 90, 270]) _create_round_corner(ysize, radius, fn);
		} else if (corner_string == "b4" || corner_string == "d4") {
			translate([radius, ysize + 0.01, radius]) rotate([270, 0, 180]) _create_round_corner(ysize, radius, fn);
		} else if (corner_string == "b3" || corner_string == "d3") {
			translate([-0.01, ysize - radius, radius]) rotate([0, 90, 0]) _create_round_corner(xsize, radius, fn);
		} else if (corner_string == "1") {
			translate([radius, radius, -0.01]) rotate([0, 0, 180]) _create_round_corner(zsize, radius, fn);
		} else if (corner_string == "2") {
			translate([xsize - radius, radius, -0.01]) rotate([0, 0, 270]) _create_round_corner(zsize, radius, fn);
		} else if (corner_string == "3") {
			translate([xsize - radius, ysize-radius, -0.01]) rotate([0, 0, 0]) _create_round_corner(zsize, radius, fn);
		} else if (corner_string == "4") {
			translate([radius, ysize-radius, -0.01]) rotate([0, 0, 90]) _create_round_corner(zsize, radius, fn);
		}
	}
}

module cuberounded(cube_size, corner_strings_array, radius = 2, fn = 16, fastpreview = false) {
	difference() {
		cube(cube_size);
		if (!fastpreview) {
			roundcorner(cube_size, corner_strings_array, radius, fn);
		}
	}
}