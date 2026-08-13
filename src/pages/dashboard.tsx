import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/bu
...
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </DashboardShell>
    </>
  );
}

export default withAuth(DashboardPage);